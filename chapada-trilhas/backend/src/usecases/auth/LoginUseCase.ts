import { UserRepository } from "../../domain/repositories/UserRepository";
import { comparePassword } from "../../infra/security/password";
import { signToken } from "../../infra/security/jwt";

export class LoginUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) throw new Error("Invalid credentials");

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  }
}

