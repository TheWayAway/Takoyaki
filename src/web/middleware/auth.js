function requireAuth(req, res, next) {
    if (req.session && req.session.authenticated) {
        return next();
    }
    res.redirect('/login');
}

function requireSuperAdmin(req, res, next) {
    if (req.session && req.session.authenticated && req.session.isSuperAdmin) {
        return next();
    }
    res.status(403).json({ error: 'Super admin access required' });
}

module.exports = { requireAuth, requireSuperAdmin };
