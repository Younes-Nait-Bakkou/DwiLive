import { Router } from "express";
import { register, login } from "../../controllers/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { AuthDomain } from "../../shared/domains/index.js"; // Import Auth domain

const router: Router = Router();

router.post("/register", validate(AuthDomain.RegisterSchema), register);
router.post("/login", validate(AuthDomain.LoginSchema), login);

export default router;
