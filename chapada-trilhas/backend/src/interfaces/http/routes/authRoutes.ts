import { Router } from "express";
import { PgUserRepository } from "../../../infra/repositories/PgUserRepository";
import { LoginUseCase } from "../../../usecases/auth/LoginUseCase";

const router = Router();
const userRepo = new PgUserRepository();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const usecase = new LoginUseCase(userRepo);
    const result = await usecase.execute(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

export default router;
