import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IAuth } from "./auth.interface";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../../config";

const loginUserIntoDB = async (payload: IAuth) => {
  const { email, password } = payload;

  const user = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  const currentUser = user.rows[0];

  //   console.log(currentUser);

  // check if the user exists
  if (user.rowCount === 0) {
    throw new Error("Invalid credentials.");
  }

  // check if the password match
  const matchPassword = await bcrypt.compare(password, currentUser.password);

  if (!matchPassword) {
    throw new Error("Invalid credentials.");
  }

  // check the user status
  if (!currentUser.is_active) {
    throw new Error("Access Denied");
  }
  //   console.log(currentUser.is_active);

  // if pass all then generate jwt token

  const jwtPayload = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    status: currentUser.is_active,
    role: currentUser.role,
  };

  const SECRET_KEY = config.secret_key;

  const accessToken = jwt.sign(jwtPayload, SECRET_KEY, { expiresIn: "1h" });

  const REFRESH_KEY = config.refresh_key;

  const refreshToken = jwt.sign(jwtPayload, REFRESH_KEY, { expiresIn: "10d" });

  delete currentUser.password;

  return { accessToken, refreshToken, user: currentUser };
};

const generateAccessToken = async (token: string) => {
  if (!token) {
    throw new Error("Unauthorized Access.");
  }

  //   2. Verify token
  const decode = jwt.verify(token as string, config.refresh_key) as JwtPayload;

  // console.log(decode);

  const user = await pool.query(
    `
            SELECT * FROM users WHERE email=$1
        `,
    [decode.email],
  );

  const currentUser = user.rows[0];

  //   3. Check if the user exists
  console.log(currentUser);
  if (user.rowCount === 0) {
    throw new Error("User not found.");
  }

  // 4. Is the user status Active
  if (!currentUser.is_active) {
    throw new Error("Forbidden.");
  }

  const jwtPayload = {
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    status: currentUser.is_active,
    role: currentUser.role,
  };

  const SECRET_KEY = config.secret_key;

  const accessToken = jwt.sign(jwtPayload, SECRET_KEY, { expiresIn: "1h" });

  return {accessToken};
};

export const authService = {
  loginUserIntoDB,
  generateAccessToken,
};
