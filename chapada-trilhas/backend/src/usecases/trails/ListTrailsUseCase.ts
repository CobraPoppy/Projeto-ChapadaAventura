import { TrailRepository } from "../../domain/repositories/TrailRepository";
import { Trail } from "../../domain/entities/Trail";

export class ListTrailsUseCase {
  constructor(private trailRepo: TrailRepository) {}

  async execute(): Promise<Trail[]> {
    return this.trailRepo.findAllPublished();
  }
}
