"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterAdminUseCase = void 0;
const password_1 = require("../../infra/security/password");
class RegisterAdminUseCase {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(name, email, password) {
        const existing = await this.userRepo.findByEmail(email);
        if (existing)
            throw new Error("Email already in use");
        const passwordHash = await (0, password_1.hashPassword)(password);
        return this.userRepo.create({ name, email, passwordHash, role: "admin" });
    }
}
exports.RegisterAdminUseCase = RegisterAdminUseCase;
