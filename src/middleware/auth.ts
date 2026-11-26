import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
import type { Role } from "../types";

const auth = (...roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(roles);
      // 1. Check if the token exist
      //  console.log(req.headers.authorization);

      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access.",
        });
      }

      //   2. Verify token
      const decode = jwt.verify(
        token as string,
        config.secret_key,
      ) as JwtPayload;

      // console.log(decode);

      const user = await pool.query(
        `
            SELECT * FROM users WHERE email=$1
        `,
        [decode.email],
      );

      //   3. Check if the user exists
      //   console.log(user.rows[0]);
      if (user.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // 4. Is the user status Active
      if (!user.rows[0].is_active) {
        return res.status(403).json({
          success: false,
          message: "Forbidden.",
        });
      }

      // roles = ["admin", "agent", "user"]
      // user.role = "admin"

      if (roles.length > 0 && !roles.includes(user.rows[0].role)) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized access.",
        });
      }

      // console.log(req); req : {body : "", user : ""}

      req.user = decode;

      console.log(req);

      next();
    } catch (error) {
      next(error);
    }
  };
};

export default auth;
