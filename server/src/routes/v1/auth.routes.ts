import { Router } from "express";
import { register, login } from "../../controllers/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { Auth } from "../../shared/domains/index.js"; // Import Auth domain

const router: Router = Router();

router.post("/register", validate(Auth.RegisterSchema), register);
router.post("/login", validate(Auth.LoginSchema), login);

export default router;
