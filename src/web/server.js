const express = require('express');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const path = require('path');
const config = require('../config');
const db = require('../database/index');
const { events } = require('../database/events');
const { requireAuth, requireSuperAdmin } = require('./middleware/auth');

const app = express();

// Trust proxy (Cloudflare tunnel)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Session setup
app.use(session({
    store: new SqliteStore({
        client: db,
        expired: {
            clear: true,
            intervalMs: 900000 // 15 minutes
        }
    }),
    secret: config.web.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: config.nodeEnv === 'production',
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    }
}));

// Routes
app.get('/login', (req, res) => {
    if (req.session.authenticated) {
        return res.redirect('/');
    }
    res.render('login', { error: null });
});

app.post('/login', (req, res) => {
    const { password } = req.body;

    // Check super admin password first
    if (config.web.superAdminPassword && password === config.web.superAdminPassword) {
        req.session.authenticated = true;
        req.session.isSuperAdmin = true;
        return res.redirect('/');
    }

    if (password === config.web.password) {
        req.session.authenticated = true;
        req.session.isSuperAdmin = false;
        return res.redirect('/');
    }

    res.render('login', { error: 'Invalid password' });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Protected routes
app.get('/', requireAuth, (req, res) => {
    const eventList = events.getAllChronological();
    res.render('timeline', {
        events: eventList,
        isSuperAdmin: req.session.isSuperAdmin || false
    });
});

// API endpoints
app.get('/api/events', requireAuth, (req, res) => {
    const eventList = events.getAllChronological();
    res.json(eventList);
});

app.get('/api/events/:id', requireAuth, (req, res) => {
    const event = events.getById(parseInt(req.params.id, 10));
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
});

app.put('/api/events/:id', requireSuperAdmin, (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { eventDate, title, description } = req.body;

    const event = events.getById(id);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    const updates = {};
    if (eventDate !== undefined) updates.eventDate = eventDate;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    const updated = events.update(id, updates, 'web-admin');
    res.json(updated);
});

app.delete('/api/events/:id', requireSuperAdmin, (req, res) => {
    const id = parseInt(req.params.id, 10);

    const event = events.getById(id);
    if (!event) {
        return res.status(404).json({ error: 'Event not found' });
    }

    events.delete(id);
    res.json({ success: true });
});

app.put('/api/events/reorder', requireSuperAdmin, (req, res) => {
    const updates = req.body;

    if (!Array.isArray(updates)) {
        return res.status(400).json({ error: 'Expected array of updates' });
    }

    // Validate each update has id and sort_order
    for (const update of updates) {
        if (typeof update.id !== 'number' || typeof update.sort_order !== 'number') {
            return res.status(400).json({ error: 'Each update must have numeric id and sort_order' });
        }
    }

    events.reorderEvents(updates);
    res.json({ success: true });
});

function start() {
    return new Promise((resolve) => {
        const server = app.listen(config.web.port, () => {
            console.log(`Web server running at http://localhost:${config.web.port}`);
            resolve(server);
        });
    });
}

module.exports = { app, start };
