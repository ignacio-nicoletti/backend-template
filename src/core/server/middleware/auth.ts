import { Request, Response, NextFunction } from "express";

// Extender la interfaz Request para incluir la propiedad 'user'
declare global {
  namespace Express {
    interface Request {
      user?: any; // Cambia 'any' por el tipo adecuado si lo conoces
    }
  }
}
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
    
    const errorMessage = error instanceof Error 
      ? tokenVerificationErrors[error.message as keyof typeof tokenVerificationErrors] || error.message
      : "Error desconocido";

    return res.status(401).json({
      success: false,
      message: "Token inválido",
      error: errorMessage,
    });
  }
};