import { Router } from "express";
import { validate } from "../../middlewares/validateResource.js";
import { AuthDomain } from "../../shared/domains/index.js"; // Import Auth domain
import { register, login } from "../../controllers/auth.controller.js";

const router: Router = Router();

router.post("/register", validate(AuthDomain.RegisterSchema), register);
router.post("/login", validate(AuthDomain.LoginSchema), login);

export default router;
