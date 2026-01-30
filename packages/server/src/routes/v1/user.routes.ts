import { Router } from "express";
import {
    getMe,
    updateMe,
    searchUsers,
} from "../../controllers/user.controller.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { withAuth } from "../../utils/routes.js";
import { UpdateMeSchema, SearchUsersSchema } from "@dwilive/shared";

const router: Router = Router();

router.use(protect);

router.get("/me", withAuth(getMe));
router.put("/me", validate(UpdateMeSchema), withAuth(updateMe));
router.get("/search", validate(SearchUsersSchema), withAuth(searchUsers));

export default router;
