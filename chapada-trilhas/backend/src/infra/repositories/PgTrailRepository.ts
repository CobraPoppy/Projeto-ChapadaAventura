import { Trail, TrailCategory, Difficulty } from "../../domain/entities/Trail";
import { TrailRepository } from "../../domain/repositories/TrailRepository";
import { pool } from "../../shared/db";

export class PgTrailRepository implements TrailRepository {
  private mapRow(row: any): Trail {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      difficulty: row.difficulty as Difficulty,
      distanceKm: Number(row.distance_km),
      durationHours: Number(row.duration_hours),
      price: Number(row.price),
      category: row.category as TrailCategory,
      location: row.location,
      mainImageUrl: row.main_image_url,
      isPublished: row.is_published,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async findAllPublished(): Promise<Trail[]> {
    const res = await pool.query("SELECT * FROM trails WHERE is_published = true ORDER BY name");
    return res.rows.map(this.mapRow);
  }

  async findAllAdmin(): Promise<Trail[]> {
    const res = await pool.query("SELECT * FROM trails ORDER BY created_at DESC");
    return res.rows.map(this.mapRow);
  }

  async findBySlug(slug: string): Promise<Trail | null> {
    const res = await pool.query("SELECT * FROM trails WHERE slug = $1", [slug]);
    if (res.rowCount === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async findById(id: number): Promise<Trail | null> {
    const res = await pool.query("SELECT * FROM trails WHERE id = $1", [id]);
    if (res.rowCount === 0) return null;
    return this.mapRow(res.rows[0]);
  }

  async create(data: Omit<Trail, "id" | "createdAt" | "updatedAt">): Promise<Trail> {
    const res = await pool.query(
      `INSERT INTO trails 
      (name, slug, description, difficulty, distance_km, duration_hours, price, category, location, main_image_url, is_published)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        data.name,
        data.slug,
        data.description,
        data.difficulty,
        data.distanceKm,
        data.durationHours,
        data.price,
        data.category,
        data.location,
        data.mainImageUrl,
        data.isPublished
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async update(id: number, data: Partial<Omit<Trail, "id">>): Promise<Trail> {
    // Implementação simples (na prática, gere dinamicamente)
    const current = await this.findById(id);
    if (!current) throw new Error("Trail not found");

    const merged = { ...current, ...data };
    const res = await pool.query(
      `UPDATE trails SET
        name=$1, slug=$2, description=$3, difficulty=$4,
        distance_km=$5, duration_hours=$6, price=$7,
        category=$8, location=$9, main_image_url=$10,
        is_published=$11, updated_at=NOW()
       WHERE id=$12 RETURNING *`,
      [
        merged.name,
        merged.slug,
        merged.description,
        merged.difficulty,
        merged.distanceKm,
        merged.durationHours,
        merged.price,
        merged.category,
        merged.location,
        merged.mainImageUrl,
        merged.isPublished,
        id
      ]
    );
    return this.mapRow(res.rows[0]);
  }

  async delete(id: number): Promise<void> {
    await pool.query("DELETE FROM trails WHERE id = $1", [id]);
  }
}
