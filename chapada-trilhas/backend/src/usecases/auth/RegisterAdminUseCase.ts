import { UserRepository } from "../../domain/repositories/UserRepository";
import { hashPassword } from "../../infra/security/password";

export class RegisterAdminUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(name: string, email: string, password: string) {
    const existing = await this.userRepo.findByEmail(email);
    if (existing) throw new Error("Email already in use");
    const passwordHash = await hashPassword(password);
    return this.userRepo.create({ name, email, passwordHash, role: "admin" });
  }
}
