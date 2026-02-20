import type { Response } from "express";

export function ok<T>(res: Response, data: T): void {
  res.status(200).json({ ok: true, data });
}

export function fail(res: Response, status: number, message: string): void {
  res.status(status).json({ ok: false, error: message });
}
