// adminAuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { IUser, UserRole } from '../../models/user.model';
import { envConfig } from "../../config/env";

export interface ExtendedUser extends IUser {
  role: UserRole;
}

const isAdminRole = (role: UserRole) => {
  return [UserRole.ADMIN, UserRole.SUPERADMIN, UserRole.COMMUNITYADMIN].includes(role);
}

export const adminProtect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Access denied. No token provided"
      });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as jwt.JwtPayload;

    const user = await User.findById(decoded.id) as ExtendedUser;

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User not found"
      });
      return;
    }

    if (isAdminRole(user.role)) {
      req.user = user;
      next();
    } else {
      res.status(403).json({
        success: false,
        message: "Access denied. User is not authorized to perform this action"
      });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Error during authentication'
    });
  }
};