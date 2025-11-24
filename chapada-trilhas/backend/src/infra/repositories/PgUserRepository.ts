import { User } from "../../domain/entities/User";
import { UserRepository } from "../../domain/repositories/UserRepository";
import { pool } from "../../shared/db";

export class PgUserRepository implements UserRepository {
  private mapRow(row: any): User {
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

  async findByEmail(email: string): Promise<User | null> {
    const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (res.rowCount === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const res = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [data.name, data.email, data.passwordHash, data.role]
    );
    return this.mapRow(res.rows[0]);
  }
}
