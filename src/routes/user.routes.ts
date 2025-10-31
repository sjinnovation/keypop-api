import express from "express";
import { 
    createUser, 
    getAllUsers, 
    getAdminUsers,
    removeUser, 
    editUser,
    getUserInfo,
    getAllAdminUsers,
    getAdminRoleCounts,
    checkEmailExists
} from "../controllers/user.controller";
import { authMiddleware } from "../global/middlewares/userAuthMiddleware";
import { requireAdminRole } from "../global/middlewares/requireAdminRole";

const router = express.Router();

router.post("/createUser", authMiddleware, requireAdminRole, createUser);
router.get("/users", authMiddleware, requireAdminRole, getAllUsers);
router.get("/admin-users", authMiddleware, requireAdminRole, getAdminUsers);
router.get("/admin-users/all", authMiddleware, requireAdminRole, getAllAdminUsers);
router.delete("/:id", authMiddleware, removeUser);
router.put("/:id", authMiddleware, requireAdminRole, editUser);
router.get("/user-info", authMiddleware, requireAdminRole, getUserInfo);
router.get("/admin-role-counts", authMiddleware, requireAdminRole, getAdminRoleCounts);
router.post("/check-email", checkEmailExists);

export default router;
