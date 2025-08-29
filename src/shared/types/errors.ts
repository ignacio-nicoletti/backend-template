export interface AppError extends Error {
  statusCode: number
  errorCode?: string
}

export interface ValidationError extends AppError {
  type: 'VALIDATION_ERROR'
}

export interface DatabaseError extends AppError {
  type: 'DATABASE_ERROR'
  dbErrorCode?: string
}

export interface ConflictError extends AppError {
  type: 'CONFLICT_ERROR'
}
