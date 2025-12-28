import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'


export const auth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' })


  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    req.user = decoded
    next()
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid token' })
  }
}