"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgContactRepository = void 0;
const db_1 = require("../../shared/db");
class PgContactRepository {
    mapRow(row) {
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            message: row.message,
            status: row.status,
            createdAt: row.created_at
        };
    }
    async create(data) {
        const res = await db_1.pool.query(`INSERT INTO contacts (name, email, message)
       VALUES ($1,$2,$3) RETURNING *`, [data.name, data.email, data.message]);
        return this.mapRow(res.rows[0]);
    }
}
exports.PgContactRepository = PgContactRepository;
