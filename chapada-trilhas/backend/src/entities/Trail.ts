export type Difficulty = "facil" | "medio" | "dificil";
export type TrailCategory = "curta" | "longa" | "travessia";

export interface Trail {
  id: number;
  name: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  distanceKm: number;
  durationHours: number;
  price: number;
  category: TrailCategory;
  location: string;
  mainImageUrl: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}
