"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactRequest_controller_1 = require("../controllers/contactRequest.controller");
const adminAuthMiddleware_1 = require("../global/middlewares/adminAuthMiddleware");
const requireAdminRole_1 = require("../global/middlewares/requireAdminRole");
const router = express_1.default.Router();
router.post("/", contactRequest_controller_1.addContactRequest);
router.get("/", adminAuthMiddleware_1.adminProtect, requireAdminRole_1.requireAdminRole, contactRequest_controller_1.getContactRequests);
router.put("/update-status/:id", adminAuthMiddleware_1.adminProtect, requireAdminRole_1.requireAdminRole, contactRequest_controller_1.updateContactRequestStatus);
exports.default = router;
