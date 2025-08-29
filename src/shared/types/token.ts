declare global {
  namespace Express {
    interface Request {
      user?: any
    }
  }
}

export type TokenPayload = {
  userId: string | number
}
