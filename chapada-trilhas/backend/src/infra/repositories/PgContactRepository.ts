import { Contact } from "../../domain/entities/Contact";
import { ContactRepository } from "../../domain/repositories/ContactRepository";
import { pool } from "../../shared/db";

export class PgContactRepository implements ContactRepository {
  private mapRow(row: any): Contact {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      status: row.status,
      createdAt: row.created_at
    };
  }

  async create(data: Omit<Contact, "id" | "createdAt" | "status">): Promise<Contact> {
    const res = await pool.query(
      `INSERT INTO contacts (name, email, message)
       VALUES ($1,$2,$3) RETURNING *`,
      [data.name, data.email, data.message]
    );
    return this.mapRow(res.rows[0]);
  }
}
