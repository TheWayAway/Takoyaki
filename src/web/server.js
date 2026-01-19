const express = require('express');
const session = require('express-session');
const SqliteStore = require('better-sqlite3-session-store')(session);
const path = require('path');
const config = require('../config');
const db = require('../database/index');
const { events } = require('../database/events');
const { requireAuth } = require('./middleware/auth');

const app = express();

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

    if (password === config.web.password) {
        req.session.authenticated = true;
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
    res.render('timeline', { events: eventList });
});

// API endpoint
app.get('/api/events', requireAuth, (req, res) => {
    const eventList = events.getAllChronological();
    res.json(eventList);
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
