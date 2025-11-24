"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PgTrailRepository_1 = require("../../../infra/repositories/PgTrailRepository");
const ListTrailsUseCase_1 = require("../../../usecases/trails/ListTrailsUseCase");
const GetTrailBySlugUseCase_1 = require("../../../usecases/trails/GetTrailBySlugUseCase");
const CreateTrailUseCase_1 = require("../../../usecases/trails/CreateTrailUseCase");
const aspects_1 = require("../../../shared/aspects");
const trailValidators_1 = require("../../validators/trailValidators");
const trailRepo = new PgTrailRepository_1.PgTrailRepository();
const router = (0, express_1.Router)();
// Público: listar trilhas
router.get("/", (0, aspects_1.withAspects)(async (req, res) => {
    const usecase = new ListTrailsUseCase_1.ListTrailsUseCase(trailRepo);
    const trails = await usecase.execute();
    res.json(trails);
}));
// Público: detalhe por slug
router.get("/:slug", (0, aspects_1.withAspects)(async (req, res) => {
    const usecase = new GetTrailBySlugUseCase_1.GetTrailBySlugUseCase(trailRepo);
    const trail = await usecase.execute(req.params.slug);
    if (!trail)
        return res.status(404).json({ error: "Trail not found" });
    res.json(trail);
}));
// Admin: listar todas
router.get("/admin/all", (0, aspects_1.withAspects)(async (req, res) => {
    const trails = await trailRepo.findAllAdmin();
    res.json(trails);
}, { requireAuth: true, auditAction: "LIST_TRAILS_ADMIN" }));
// Admin: criar
router.post("/", (0, aspects_1.withAspects)(async (req, res) => {
    const usecase = new CreateTrailUseCase_1.CreateTrailUseCase(trailRepo);
    const trail = await usecase.execute(req.body);
    res.status(201).json(trail);
}, {
    requireAuth: true,
    validate: trailValidators_1.validateCreateTrail,
    auditAction: "CREATE_TRAIL"
}));
// Admin: update & delete (similares)
router.put("/:id", (0, aspects_1.withAspects)(async (req, res) => {
    const id = Number(req.params.id);
    const current = await trailRepo.findById(id);
    if (!current)
        return res.status(404).json({ error: "Trail not found" });
    const updated = await trailRepo.update(id, req.body);
    res.json(updated);
}, { requireAuth: true, validate: trailValidators_1.validateUpdateTrail, auditAction: "UPDATE_TRAIL" }));
router.delete("/:id", (0, aspects_1.withAspects)(async (req, res) => {
    const id = Number(req.params.id);
    await trailRepo.delete(id);
    res.status(204).send();
}, { requireAuth: true, auditAction: "DELETE_TRAIL" }));
exports.default = router;
