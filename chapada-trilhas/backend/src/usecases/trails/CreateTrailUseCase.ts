import { TrailRepository } from "../../domain/repositories/TrailRepository";
import { Trail, TrailCategory, Difficulty } from "../../domain/entities/Trail";

interface CreateTrailInput {
  name: string;
  slug: string;
  description: string;
  difficulty: Difficulty;
  distanceKm: number;
  durationHours: number;
  price: number;
  category: TrailCategory;
  location: string;
  mainImageUrl?: string | null;
  isPublished: boolean;
}

export class CreateTrailUseCase {
  constructor(private trailRepo: TrailRepository) {}

  async execute(input: CreateTrailInput): Promise<Trail> {
    // Regras de negócio podem ir aqui (ex: slug único, etc.)
    return this.trailRepo.create({
      ...input,
      mainImageUrl: input.mainImageUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    } as any);
  }
}
