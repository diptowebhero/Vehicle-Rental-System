import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle custom AppError
  if ((err.status || err.statusCode) && err.message) {
    const status = err.status || err.statusCode;
    return res.status(status).json({
      success: false,
      message: err.message,
      ...(err.errorCode && { errorCode: err.errorCode }),
    });
  }

  // PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({
          success: false,
          message: 'Data already exists (duplicate entry)',
        });
      case '23503':
        return res.status(400).json({
          success: false,
          message: 'Invalid reference (e.g., vehicle or user not found)',
        });
      case '22P02':
        return res.status(400).json({
          success: false,
          message: 'Invalid data format',
        });
      default:
        break;
    }
  }

  // Unexpected errors
  res.status(500).json({
    success: false,
    message: 'Internal server error',
  });
};