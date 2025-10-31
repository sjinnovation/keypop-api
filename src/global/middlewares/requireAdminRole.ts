import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../models/user.model";

export const requireAdminRole = (req: Request, res: Response, next: NextFunction) => {
  if (req.user && [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COMMUNITYADMIN].includes(req.user.role)) {
    return next();
  } else {
    res.status(403).json({
      success: false,
      error: "Access denied. User is not authorized to perform this action"
    });
  }
};