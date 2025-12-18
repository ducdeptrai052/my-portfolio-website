import { Response } from "express";

export function sendOk<T>(
  res: Response,
  data?: T,
  message: string = "OK",
  statusCode: number = 200
) {
  return res.status(statusCode).json({ status: "ok", message, data });
}

export function sendCreated<T>(res: Response, data?: T, message = "Created") {
  return sendOk(res, data, message, 201);
}

export function sendError(
  res: Response,
  message: string = "Error",
  statusCode: number = 400
) {
  return res.status(statusCode).json({ status: "error", message });
}
