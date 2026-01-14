import { Router } from "express";
import { getMe, updateMe, searchUsers } from "../../controllers/user.js";
import { protect } from "../../middlewares/auth.js";

const router: Router = Router();

router.use(protect);

router.get("/me", getMe);
router.put("/me", updateMe);
router.get("/search", searchUsers);

export default router;
