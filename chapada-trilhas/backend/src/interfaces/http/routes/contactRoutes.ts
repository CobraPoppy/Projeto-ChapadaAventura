import { Router } from "express";
import { PgContactRepository } from "../../../infra/repositories/PgContactRepository";
import { CreateContactUseCase } from "../../../usecases/contacts/CreateContactUseCase";
import { withAspects } from "../../../shared/aspects";
import { validateCreateContact } from "../../validators/contactValidators";

const router = Router();
const contactRepo = new PgContactRepository();

router.post(
  "/",
  withAspects(
    async (req, res) => {
      const usecase = new CreateContactUseCase(contactRepo);
      const contact = await usecase.execute(req.body);
      res.status(201).json(contact);
    },
    { validate: validateCreateContact, auditAction: "CREATE_CONTACT" }
  )
);

export default router;
