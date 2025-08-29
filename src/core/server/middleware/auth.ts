import { NextFunction, Request, Response } from "express";
import { tokenVerificationErrors, verifyToken } from "../../../shared/utils/token";

export const authRequired = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token de cookies o headers
    const token = req.cookies.authToken || req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No se proporcionó token de autenticación",
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded; // Asegúrate de extender el tipo Request
    next();
  } catch (error) {
    console.error("Error en auth middleware:", error);

    const errorMessage =
      error instanceof Error
        ? tokenVerificationErrors[error.message as keyof typeof tokenVerificationErrors] ||
          error.message
        : "Error desconocido";

    return res.status(401).json({
      success: false,
      message: "Token inválido",
      error: errorMessage,
    });
  }
};
