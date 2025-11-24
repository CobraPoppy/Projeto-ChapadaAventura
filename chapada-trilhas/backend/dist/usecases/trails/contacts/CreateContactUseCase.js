"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactUseCase = void 0;
class CreateContactUseCase {
    constructor(contactRepo) {
        this.contactRepo = contactRepo;
    }
    async execute(input) {
        return this.contactRepo.create({
            name: input.name,
            email: input.email,
            message: input.message
        });
    }
}
exports.CreateContactUseCase = CreateContactUseCase;
