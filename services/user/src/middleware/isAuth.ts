import type { Request, Response, NextFunction } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { IUser } from "../model/User.js";

export interface AuthenticatedRequest extends Request {
  user?: IUser | null;
}

export const isAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      res.status(401).json({
        message: "Please Login - No auth header or wrong auth header",
      });
      return;
    }

    const token = authHeader.split(" ")[1] as string;

    const decodeToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (!decodeToken || !decodeToken.user) {
      res.status(401).json({ message: "Invalid Token" });
      return;
    }

    req.user = decodeToken.user;
    next();
  } catch (error: any) {
    console.error("JWT verification error: ", error);
    res.status(401).json({ message: "Please Login - JWT error" });
    return;
  }
};


