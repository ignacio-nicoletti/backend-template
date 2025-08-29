import { Response } from 'express'
import { AppError, ConflictError, DatabaseError, ValidationError } from '../../../shared/types'

// Factory functions para crear errores
export const createAppError = (
  message: string,
  statusCode: number = 500,
  errorCode?: string
): AppError => {
  const error = new Error(message) as AppError
  error.statusCode = statusCode
  error.errorCode = errorCode
  error.name = 'AppError'
  return error
}

export const createValidationError = (message: string): ValidationError => {
  const error = createAppError(message, 400, 'VALIDATION_ERROR') as ValidationError
  error.type = 'VALIDATION_ERROR'
  return error
}

export const createDatabaseError = (message: string, dbErrorCode?: string): DatabaseError => {
  const error = createAppError(message, 500, 'DATABASE_ERROR') as DatabaseError
  error.type = 'DATABASE_ERROR'
  error.dbErrorCode = dbErrorCode
  return error
}

export const createConflictError = (message: string): ConflictError => {
  const error = createAppError(message, 409, 'CONFLICT_ERROR') as ConflictError
  error.type = 'CONFLICT_ERROR'
  return error
}

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof Error && 'statusCode' in error
}

export const isValidationError = (error: unknown): error is ValidationError => {
  return isAppError(error) && error.errorCode === 'VALIDATION_ERROR'
}

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return isAppError(error) && error.errorCode === 'DATABASE_ERROR'
}

export const isConflictError = (error: unknown): error is ConflictError => {
  return isAppError(error) && error.errorCode === 'CONFLICT_ERROR'
}

// Manejador de errores
export const errorHandler = (
  error: unknown,

  res: Response
) => {
  // Manejo de errores de base de datos PostgreSQL
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const dbError = error as { code: string }

    if (dbError.code === '23505') {
      // Violación de constraint único
      return res.status(409).json({
        success: false,
        message: 'El recurso ya existe',
        error: 'DUPLICATE_ENTRY',
        ...(process.env.NODE_ENV === 'development' && { details: error }),
      })
    }

    if (dbError.code === '23503') {
      // Violación de foreign key
      return res.status(400).json({
        success: false,
        message: 'Referencia inválida',
        error: 'FOREIGN_KEY_VIOLATION',
        ...(process.env.NODE_ENV === 'development' && { details: error }),
      })
    }
  }

  // Manejo de AppError personalizados
  if (isAppError(error)) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
      error: error.errorCode || error.name,
      ...(process.env.NODE_ENV === 'development' && {
        stack: error.stack,
        ...(isDatabaseError(error) && { dbErrorCode: error.dbErrorCode }),
      }),
    })
  }

  // Error genérico no manejado
  console.error('Error no manejado:', error)

  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && {
      stack: error instanceof Error ? error.stack : undefined,
      details: error,
    }),
  })
}
