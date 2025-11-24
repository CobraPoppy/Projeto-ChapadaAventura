"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTrailUseCase = void 0;
class CreateTrailUseCase {
    constructor(trailRepo) {
        this.trailRepo = trailRepo;
    }
    async execute(input) {
        // Regras de negócio podem ir aqui (ex: slug único, etc.)
        return this.trailRepo.create({
            ...input,
            mainImageUrl: input.mainImageUrl ?? null,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
}
exports.CreateTrailUseCase = CreateTrailUseCase;
