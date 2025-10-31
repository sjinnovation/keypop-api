import express from "express";
import { authMiddleware } from "../global/middlewares/userAuthMiddleware";
import { addContactRequest, getContactRequests, updateContactRequestStatus } from "../controllers/contactRequest.controller";
import { adminProtect } from "../global/middlewares/adminAuthMiddleware";
import { requireAdminRole } from "../global/middlewares/requireAdminRole";

const router = express.Router();

router.post("/", addContactRequest);
router.get("/", adminProtect, requireAdminRole, getContactRequests);
router.put("/update-status/:id", adminProtect, requireAdminRole, updateContactRequestStatus);

export default router;