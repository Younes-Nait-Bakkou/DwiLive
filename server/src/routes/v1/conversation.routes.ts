import { Router } from "express";
import {
    createConversation,
    getConversations,
    addMember,
    removeMember,
    getMessages,
    leaveConversation,
} from "../../controllers/conversation.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import {
    createConversationSchema,
    addMemberSchema,
    removeMemberSchema,
    leaveConversationSchema,
    getMessagesSchema,
} from "../../schemas/conversation.schema.js";

const router: Router = Router();

router.use(protect);

router.post("/", validate(createConversationSchema), createConversation);
router.get("/", getConversations);
router.post("/:conversationId/members", validate(addMemberSchema), addMember);
router.delete(
    "/:conversationId/members/:userId",
    validate(removeMemberSchema),
    removeMember,
);
router.get("/:conversationId/messages", validate(getMessagesSchema), getMessages);
router.post("/:conversationId/leave", validate(leaveConversationSchema), leaveConversation);

export default router;
