import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserRole, Gender, SexualOrientation }  from "../../models/user.model";
import { envConfig } from "../../config/env";
import { KeyPopulation } from "../../models/survey.model";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const validateUserData = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role, gender, sexualOrientation, keyPopulation, age } = req.body;

  const errors: string[] = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    errors.push('Valid email is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (role && !Object.values(UserRole).includes(role)) {
    errors.push('Invalid role');
  }

  if (gender && !Object.values(Gender).includes(gender)) {
    errors.push('Invalid gender');
  }

  if (sexualOrientation && !Object.values(SexualOrientation).includes(sexualOrientation)) {
    errors.push('Invalid sexual orientation');
  }

  if (keyPopulation) {
    if (!Array.isArray(keyPopulation)) {
      errors.push('Key population must be an array');
    } else if (!keyPopulation.every(item => Object.values(KeyPopulation).includes(item))) {
      errors.push('Invalid key population');
    }
  }

  if (age !== undefined && (typeof age !== 'number' || age < 0 || age > 120)) {
    errors.push('Age must be between 0 and 120');
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  next();
};

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: "Access denied. No token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as {
      id: string;
    };

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    req.user = user;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        error: "Invalid token",
      });
      return;
    }

    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        error: "Token expired",
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Server error during authentication",
    });
  }
};