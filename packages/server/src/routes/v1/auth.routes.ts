import { Router } from "express";
import { validate } from "../../middlewares/validateResource.js";
import { LoginSchema, RegisterSchema } from "@dwilive/shared/domains"; // Import Auth domain
import { register, login } from "../../controllers/auth.controller.js";

const router: Router = Router();

router.post("/register", validate(RegisterSchema), register);
router.post("/login", validate(LoginSchema), login);

export default router;
