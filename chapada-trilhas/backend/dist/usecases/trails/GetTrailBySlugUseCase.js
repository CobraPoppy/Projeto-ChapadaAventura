"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTrailBySlugUseCase = void 0;
class GetTrailBySlugUseCase {
    constructor(trailRepo) {
        this.trailRepo = trailRepo;
    }
    async execute(slug) {
        return this.trailRepo.findBySlug(slug);
    }
}
exports.GetTrailBySlugUseCase = GetTrailBySlugUseCase;
