import bcrypt from "bcryptjs";
import { pool } from "../../db";
import type { IAuth } from "./auth.interface";

const loginUserIntoDB = async (payload: IAuth) => {
  const { email, password } = payload;

  const user = await pool.query(
    `
        SELECT * FROM users WHERE email=$1
        `,
    [email],
  );

  //   console.log(user.rows[0]);

  // check if the user exists
  if (user.rowCount === 0) {
    throw new Error("Invalid credentials.");
  }

  // check if the password match
  const matchPassword = await bcrypt.compare(password, user.rows[0].password);

  if (!matchPassword) {
    throw new Error("Invalid credentials.");
  }

  // check the user status
  if (!user.rows[0].is_active) {
    throw new Error("Access Denied");
  }
  //   console.log(user.rows[0].is_active);

  // if pass all then generate jwt token
};

export const authService = {
  loginUserIntoDB,
};
