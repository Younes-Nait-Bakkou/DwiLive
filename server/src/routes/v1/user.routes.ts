import { Router } from "express";
import {
    getMe,
    updateMe,
    searchUsers,
} from "../../controllers/user.controller.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { UserDomain } from "../../shared/domains/index.js";
import { withAuth } from "../../utils/routes.js";

const router: Router = Router();

router.use(protect);

router.get("/me", withAuth(getMe));
router.put("/me", validate(UserDomain.UpdateMeSchema), withAuth(updateMe));
router.get(
    "/search",
    validate(UserDomain.SearchUsersSchema),
    withAuth(searchUsers),
);

export default router;
