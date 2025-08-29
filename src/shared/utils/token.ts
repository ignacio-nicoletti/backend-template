import jwt from "jsonwebtoken";
import { TokenPayload } from "../types";
import { Response } from "express";

export const generateToken = (payload: TokenPayload) => {
  const expiresIn = 60 * 60 * 8; // 8 horas

  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET no está definido");
  }

  const token = jwt.sign(payload, process.env.TOKEN_SECRET, { expiresIn });
  return { token, expiresIn };
};

export const generateRefreshToken = (userId: string | number, res: Response) => {
  const expiresIn = 60 * 60 * 24 * 30; // 30 días

  if (!process.env.TOKEN_REFRESH) {
    throw new Error("TOKEN_REFRESH no está definido");
  }

  const refreshToken = jwt.sign({ userId }, process.env.TOKEN_REFRESH, {
    expiresIn,
  });

  const isProduction = process.env.NODE_ENV === "production";

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: expiresIn * 1000,
    path: "/api/auth/refresh",
  });

  return refreshToken;
};

export const verifyToken = (token: string) => {
  if (!process.env.TOKEN_SECRET) {
    throw new Error("TOKEN_SECRET no está definido");
  }

  return jwt.verify(token, process.env.TOKEN_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  if (!process.env.TOKEN_REFRESH) {
    throw new Error("TOKEN_REFRESH no está definido");
  }

  return jwt.verify(token, process.env.TOKEN_REFRESH);
};

export const tokenVerificationErrors = {
  "invalid signature": "La firma del JWT no es válida",
  "jwt expired": "JWT expirado",
  "invalid token": "Token no válido",
  "No Bearer": "Utiliza formato Bearer",
  "jwt malformed": "JWT formato no válido",
};
