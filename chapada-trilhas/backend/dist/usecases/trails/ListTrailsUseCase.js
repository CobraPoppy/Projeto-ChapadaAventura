"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListTrailsUseCase = void 0;
class ListTrailsUseCase {
    constructor(trailRepo) {
        this.trailRepo = trailRepo;
    }
    async execute() {
        return this.trailRepo.findAllPublished();
    }
}
exports.ListTrailsUseCase = ListTrailsUseCase;
