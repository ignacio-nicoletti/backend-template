import bcrypt from 'bcrypt'

import { users } from '../../entities/user.schema.js'
import { db } from '../../../core/database.js'
import { Request, Response } from 'express'
import { generateRefreshToken, generateToken } from '../../../shared/utils/token.js'
import { eq } from 'drizzle-orm'

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email y contraseña válidos son requeridos',
    })
  }

  try {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciales inválidas',
      })
    }

    const { token, expiresIn } = generateToken({
      userId: user.id,
    })

    generateRefreshToken(user.id, res)

    const isProduction = process.env.NODE_ENV === 'production'

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/',
    } as const

    // Token de acceso
    res.cookie('authToken', token, {
      ...cookieOptions,
      maxAge: expiresIn * 1000,
    })

    return res.status(200).json({
      success: true,
      expiresIn,
      user: user,
    })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({
      success: false,
      message: 'Error en el proceso de autenticación',
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
  }
}
