import { Router } from "express";
import {
    createConversation,
    getConversations,
    addMember,
    removeMember,
    getMessages,
    leaveConversation,
} from "../../controllers/conversation.controller.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { ConversationDomain } from "../../shared/domains/index.js";
import { withAuth } from "../../utils/routes.js";

const router: Router = Router();

router.use(protect);

router.post(
    "/",
    validate(ConversationDomain.CreateConversationSchema),
    withAuth(createConversation),
);
router.get("/", withAuth(getConversations));
router.post(
    "/:conversationId/members",
    validate(ConversationDomain.AddMemberSchema),
    withAuth(addMember),
);
router.delete(
    "/:conversationId/members/:userId",
    validate(ConversationDomain.RemoveMemberSchema),
    withAuth(removeMember),
);
router.get(
    "/:conversationId/messages",
    validate(ConversationDomain.GetMessagesSchema),
    withAuth(getMessages),
);
router.post(
    "/:conversationId/leave",
    validate(ConversationDomain.LeaveConversationSchema),
    withAuth(leaveConversation),
);

export default router;
