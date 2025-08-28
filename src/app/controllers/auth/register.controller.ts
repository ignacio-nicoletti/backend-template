import { Request, Response } from "express";
import { users } from "../../entities";
import { db } from "../../../core/database";
import { createValidationError } from "../../../core/server/middleware/errorHandler";
import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 10;

export const register = async (req: Request, res: Response) => {
  const { name, lastName, email, password, roleName, phone } = req.body;

  try {
    // Validaciones
    if (!name || !lastName || !email || !password) {
      throw createValidationError("Nombre, apellido, email y password son requeridos");
    }

    if (password.length < 6) {
      throw createValidationError("La contraseña debe tener al menos 6 caracteres");
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      throw createValidationError("El formato del email no es válido");
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // Usar transaction
    const result = await db.transaction(async (tx) => {
      // Insertar usuario dentro de la transacción
      const userResult = await tx
        .insert(users)
        .values({
          firstName: name || "",
          lastname: lastName || "",
          email: email,
          password: hashedPassword,
          phone: phone || "",
          verify: true,
          dni: "",
          lastLogin: new Date().toISOString(),
          imageProfile: "",
          aadmission: new Date().toISOString(),
          state: true,
        })
        .returning();

      return userResult;
    });

    // Respuesta exitosa fuera de la transacción
    res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    throw error;
  }
};
