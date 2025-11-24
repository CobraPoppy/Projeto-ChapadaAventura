"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgUserRepository = void 0;
const db_1 = require("../../shared/db");
class PgUserRepository {
    mapRow(row) {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            passwordHash: row.password_hash,
            role: row.role,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
    async findByEmail(email) {
        const res = await db_1.pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (res.rowCount === 0)
            return null;
        return this.mapRow(res.rows[0]);
    }
    async create(data) {
        const res = await db_1.pool.query(`INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING *`, [data.name, data.email, data.passwordHash, data.role]);
        return this.mapRow(res.rows[0]);
    }
}
exports.PgUserRepository = PgUserRepository;
