import { Router } from "express";
import { PgTrailRepository } from "../../../infra/repositories/PgTrailRepository";
import { ListTrailsUseCase } from "../../../usecases/trails/ListTrailsUseCase";
import { GetTrailBySlugUseCase } from "../../../usecases/trails/GetTrailBySlugUseCase";
import { CreateTrailUseCase } from "../../../usecases/trails/CreateTrailUseCase";
import { PgTrailRepository as PgRepo } from "../../../infra/repositories/PgTrailRepository";
import { withAspects } from "../../../shared/aspects";
import { validateCreateTrail, validateUpdateTrail } from "../../validators/trailValidators";

const trailRepo = new PgTrailRepository();
const router = Router();

// Público: listar trilhas
router.get(
  "/",
  withAspects(async (req, res) => {
    const usecase = new ListTrailsUseCase(trailRepo);
    const trails = await usecase.execute();
    res.json(trails);
  })
);

// Público: detalhe por slug
router.get(
  "/:slug",
  withAspects(async (req, res) => {
    const usecase = new GetTrailBySlugUseCase(trailRepo);
    const trail = await usecase.execute(req.params.slug);
    if (!trail) return res.status(404).json({ error: "Trail not found" });
    res.json(trail);
  })
);

// Admin: listar todas
router.get(
  "/admin/all",
  withAspects(
    async (req, res) => {
      const trails = await trailRepo.findAllAdmin();
      res.json(trails);
    },
    { requireAuth: true, auditAction: "LIST_TRAILS_ADMIN" }
  )
);

// Admin: criar
router.post(
  "/",
  withAspects(
    async (req, res) => {
      const usecase = new CreateTrailUseCase(trailRepo);
      const trail = await usecase.execute(req.body);
      res.status(201).json(trail);
    },
    {
      requireAuth: true,
      validate: validateCreateTrail,
      auditAction: "CREATE_TRAIL"
    }
  )
);

// Admin: update & delete (similares)
router.put(
  "/:id",
  withAspects(
    async (req, res) => {
      const id = Number(req.params.id);
      const current = await trailRepo.findById(id);
      if (!current) return res.status(404).json({ error: "Trail not found" });
      const updated = await trailRepo.update(id, req.body);
      res.json(updated);
    },
    { requireAuth: true, validate: validateUpdateTrail, auditAction: "UPDATE_TRAIL" }
  )
);

router.delete(
  "/:id",
  withAspects(
    async (req, res) => {
      const id = Number(req.params.id);
      await trailRepo.delete(id);
      res.status(204).send();
    },
    { requireAuth: true, auditAction: "DELETE_TRAIL" }
  )
);

export default router;
