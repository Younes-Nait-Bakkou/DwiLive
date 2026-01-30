import { Router } from "express";
import {
    createConversation,
    getConversations,
    addMember,
    removeMember,
    getMessages,
    leaveConversation,
    joinConversation,
} from "../../controllers/conversation.controller.js";
import { protect } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validateResource.js";
import { withAuth } from "../../utils/routes.js";
import {
    CreateConversationSchema,
    AddMemberSchema,
    RemoveMemberSchema,
    GetMessagesSchema,
    JoinConversationSchema,
    LeaveConversationSchema,
} from "@dwilive/shared";

const router: Router = Router();

router.use(protect);

router.post(
    "/",
    validate(CreateConversationSchema),
    withAuth(createConversation),
);
router.get("/", withAuth(getConversations));
router.post(
    "/:conversationId/members",
    validate(AddMemberSchema),
    withAuth(addMember),
);
router.delete(
    "/:conversationId/members/:userId",
    validate(RemoveMemberSchema),
    withAuth(removeMember),
);
router.get(
    "/:conversationId/messages",
    validate(GetMessagesSchema),
    withAuth(getMessages),
);

router.post(
    "/:conversationId/join",
    validate(JoinConversationSchema),
    withAuth(joinConversation),
);
router.post(
    "/:conversationId/leave",
    validate(LeaveConversationSchema),
    withAuth(leaveConversation),
);

export default router;
