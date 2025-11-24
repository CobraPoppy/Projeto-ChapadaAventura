import { TrailRepository } from "../../domain/repositories/TrailRepository";
import { Trail } from "../../domain/entities/Trail";

export class GetTrailBySlugUseCase {
  constructor(private trailRepo: TrailRepository) {}

  async execute(slug: string): Promise<Trail | null> {
    return this.trailRepo.findBySlug(slug);
  }
}
