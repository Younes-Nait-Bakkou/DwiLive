import { Router } from "express";
import {
    createRoom,
    getRooms,
    addMember,
    removeMember,
    getMessages,
    leaveRoom,
} from "../../controllers/room.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import {
    createRoomSchema,
    addMemberSchema,
    removeMemberSchema,
    leaveRoomSchema,
    getMessagesSchema,
} from "../../schemas/room.schema.js";

const router: Router = Router();

router.use(protect);

router.post("/", validate(createRoomSchema), createRoom);
router.get("/", getRooms);
router.post("/:roomId/members", validate(addMemberSchema), addMember);
router.delete(
    "/:roomId/members/:userId",
    validate(removeMemberSchema),
    removeMember,
);
router.get("/:roomId/messages", validate(getMessagesSchema), getMessages);
router.post("/:roomId/leave", validate(leaveRoomSchema), leaveRoom);

export default router;
