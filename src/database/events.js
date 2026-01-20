const db = require('./index');

// Event CRUD operations
const events = {
    create(eventDate, title, description, createdBy, eventTime = null) {
        const stmt = db.prepare(`
            INSERT INTO events (event_date, title, description, created_by, created_at, event_time)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = stmt.run(eventDate, title, description, createdBy, Date.now(), eventTime);
        return result.lastInsertRowid;
    },

    getById(id) {
        const stmt = db.prepare('SELECT * FROM events WHERE id = ?');
        return stmt.get(id);
    },

    getAll(options = {}) {
        const { limit = 50, before, after, orderDesc = true } = options;
        let query = 'SELECT * FROM events WHERE 1=1';
        const params = [];

        if (before) {
            query += ' AND event_date < ?';
            params.push(before);
        }
        if (after) {
            query += ' AND event_date > ?';
            params.push(after);
        }

        query += ` ORDER BY event_date ${orderDesc ? 'DESC' : 'ASC'}, id ${orderDesc ? 'DESC' : 'ASC'}`;
        query += ' LIMIT ?';
        params.push(limit);

        const stmt = db.prepare(query);
        return stmt.all(...params);
    },

    getAllChronological() {
        const stmt = db.prepare('SELECT * FROM events ORDER BY event_date ASC, sort_order ASC, id ASC');
        return stmt.all();
    },

    updateSortOrder(eventId, sortOrder) {
        const stmt = db.prepare('UPDATE events SET sort_order = ? WHERE id = ?');
        stmt.run(sortOrder, eventId);
    },

    reorderEvents(updates) {
        const stmt = db.prepare('UPDATE events SET sort_order = ? WHERE id = ?');
        const transaction = db.transaction((items) => {
            for (const { id, sort_order } of items) {
                stmt.run(sort_order, id);
            }
        });
        transaction(updates);
    },

    update(id, updates, updatedBy) {
        const event = this.getById(id);
        if (!event) return null;

        const fields = [];
        const params = [];

        if (updates.eventDate !== undefined) {
            fields.push('event_date = ?');
            params.push(updates.eventDate);
        }
        if (updates.title !== undefined) {
            fields.push('title = ?');
            params.push(updates.title);
        }
        if (updates.description !== undefined) {
            fields.push('description = ?');
            params.push(updates.description);
        }
        if (updates.eventTime !== undefined) {
            fields.push('event_time = ?');
            params.push(updates.eventTime);
        }

        if (fields.length === 0) return event;

        fields.push('updated_by = ?', 'updated_at = ?');
        params.push(updatedBy, Date.now());
        params.push(id);

        const stmt = db.prepare(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`);
        stmt.run(...params);

        return this.getById(id);
    },

    delete(id) {
        const event = this.getById(id);
        if (!event) return false;

        const stmt = db.prepare('DELETE FROM events WHERE id = ?');
        stmt.run(id);
        return true;
    }
};

// Guild config operations
const guildConfig = {
    get(guildId) {
        const stmt = db.prepare('SELECT * FROM guild_config WHERE guild_id = ?');
        const row = stmt.get(guildId);
        if (!row) {
            return { guild_id: guildId, allowed_roles: [] };
        }
        return {
            ...row,
            allowed_roles: JSON.parse(row.allowed_roles)
        };
    },

    setAllowedRoles(guildId, roles) {
        const stmt = db.prepare(`
            INSERT INTO guild_config (guild_id, allowed_roles)
            VALUES (?, ?)
            ON CONFLICT(guild_id) DO UPDATE SET allowed_roles = excluded.allowed_roles
        `);
        stmt.run(guildId, JSON.stringify(roles));
    },

    addRole(guildId, roleId) {
        const config = this.get(guildId);
        if (!config.allowed_roles.includes(roleId)) {
            config.allowed_roles.push(roleId);
            this.setAllowedRoles(guildId, config.allowed_roles);
        }
        return config.allowed_roles;
    },

    removeRole(guildId, roleId) {
        const config = this.get(guildId);
        config.allowed_roles = config.allowed_roles.filter(r => r !== roleId);
        this.setAllowedRoles(guildId, config.allowed_roles);
        return config.allowed_roles;
    }
};

module.exports = { events, guildConfig };
