import bcrypt from "bcrypt";
import { User, Roles } from "../../config/sequelize.js";
import { generateToken, generateRefreshToken } from "../../utils/token.js";

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password || typeof password !== "string") {
    return res.status(400).json({
      success: false,
      message: "Email y contraseña válidos son requeridos",
    });
  }

  try {
    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["id", "rol"],
          required: true,
        },
      ],
      attributes: ["id", "name", "lastName", "email", "password"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const passwordMatch = await bcrypt.compare(String(password), String(user.password));

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Credenciales inválidas",
      });
    }

    const { token, expiresIn } = generateToken({
      userId: user.id,
      role: user.role.rol,
    });

    const refreshToken = generateRefreshToken(user.id, res);

    const isProduction = process.env.NODE_ENV === "production";

    // Configuración de cookies optimizada
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
    };

    res.cookie("authToken", token, {
      ...cookieOptions,
      maxAge: expiresIn * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/auth/refresh",
    });

    return res.status(200).json({
      success: true,
      expiresIn,
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        role: user.role.rol,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error en el proceso de autenticación",
      error: error.message,
    });
  }
};
