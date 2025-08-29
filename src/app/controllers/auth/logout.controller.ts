import { Response } from "express";

export const logout = (res: Response) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("refreshToken", {
      path: "/api/auth/refresh",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    res.clearCookie("authToken", {
      path: "/",
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Sesión cerrada correctamente",
    });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({
      success: false,
      message: "Error al cerrar la sesión",
    });
  }
};
