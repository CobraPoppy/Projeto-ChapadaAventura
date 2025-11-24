"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PgUserRepository_1 = require("../../../infra/repositories/PgUserRepository");
const LoginUseCase_1 = require("../../../usecases/auth/LoginUseCase");
const router = (0, express_1.Router)();
const userRepo = new PgUserRepository_1.PgUserRepository();
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const usecase = new LoginUseCase_1.LoginUseCase(userRepo);
        const result = await usecase.execute(email, password);
        res.json(result);
    }
    catch (err) {
        res.status(401).json({ error: err.message });
    }
});
exports.default = router;
