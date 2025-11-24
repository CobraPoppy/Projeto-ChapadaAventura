"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const password_1 = require("../../infra/security/password");
const jwt_1 = require("../../infra/security/jwt");
class LoginUseCase {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async execute(email, password) {
        const user = await this.userRepo.findByEmail(email);
        if (!user)
            throw new Error("Invalid credentials");
        const ok = await (0, password_1.comparePassword)(password, user.passwordHash);
        if (!ok)
            throw new Error("Invalid credentials");
        const token = (0, jwt_1.signToken)({ id: user.id, email: user.email, role: user.role });
        return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
    }
}
exports.LoginUseCase = LoginUseCase;
