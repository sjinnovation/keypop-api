"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminRole = void 0;
const user_model_1 = require("../../models/user.model");
const requireAdminRole = (req, res, next) => {
    if (req.user && [user_model_1.UserRole.ADMIN, user_model_1.UserRole.SUPERADMIN, user_model_1.UserRole.COMMUNITYADMIN].includes(req.user.role)) {
        return next();
    }
    else {
        res.status(403).json({
            success: false,
            error: "Access denied. User is not authorized to perform this action"
        });
    }
};
exports.requireAdminRole = requireAdminRole;
