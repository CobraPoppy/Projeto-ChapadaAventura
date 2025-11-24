import { Trail } from "../entities/Trail";

export interface TrailRepository {
  findAllPublished(): Promise<Trail[]>;
  findAllAdmin(): Promise<Trail[]>;
  findBySlug(slug: string): Promise<Trail | null>;
  findById(id: number): Promise<Trail | null>;
  create(data: Omit<Trail, "id" | "createdAt" | "updatedAt">): Promise<Trail>;
  update(id: number, data: Partial<Omit<Trail, "id">>): Promise<Trail>;
  delete(id: number): Promise<void>;
}
