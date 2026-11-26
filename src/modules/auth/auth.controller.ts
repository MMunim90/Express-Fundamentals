import type { Request, Response } from "express";
import { authService } from "./auth.service";
import sendResponse from "../../utils/sendResponse";

const loginUser = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginUserIntoDB(req.body);

    const { refreshToken } = result;

    res.cookie("refresh_key", refreshToken, {
      secure: false, // http -> false, https -> true ? In Production -> true
      httpOnly: true, // prevent XSS attack
      sameSite: "lax", // "none", "strict", "lax" -> prevent CSRF attack
      // maxAge,
      path: "/",
      domain: "localhost", // example.com
    });

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User login successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error?.message,
      error: error,
    });
  }
};

const generateToken = async (req: Request, res: Response) => {
  try {
    // console.log(req.cookies.refresh_key);
    const result = await authService.generateAccessToken(
      req.cookies.refresh_key,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Access Token Generated Successfully",
      data: result,
    });
  } catch (error: any) {
    sendResponse(res, {
      statusCode: 500,
      success: false,
      message: error?.message,
      error: error,
    });
  }
};

export const authController = {
  loginUser,
  generateToken,
};
