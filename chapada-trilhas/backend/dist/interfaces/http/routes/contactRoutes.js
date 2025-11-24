"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const PgContactRepository_1 = require("../../../infra/repositories/PgContactRepository");
const CreateContactUseCase_1 = require("../../../usecases/contacts/CreateContactUseCase");
const aspects_1 = require("../../../shared/aspects");
const contactValidators_1 = require("../../validators/contactValidators");
const router = (0, express_1.Router)();
const contactRepo = new PgContactRepository_1.PgContactRepository();
router.post("/", (0, aspects_1.withAspects)(async (req, res) => {
    const usecase = new CreateContactUseCase_1.CreateContactUseCase(contactRepo);
    const contact = await usecase.execute(req.body);
    res.status(201).json(contact);
}, { validate: contactValidators_1.validateCreateContact, auditAction: "CREATE_CONTACT" }));
exports.default = router;
