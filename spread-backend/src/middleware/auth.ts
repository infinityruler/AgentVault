import { NextFunction, Request, Response } from 'express';
import { supabaseAdmin } from '../config/supabase';
import { HttpError } from '../utils/http';

function extractBearerToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Missing or invalid authorization header');
  }
  return authHeader.slice('Bearer '.length);
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractBearerToken(req);
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user) {
      throw new HttpError(401, 'Invalid access token');
    }

    const { data: appUser, error: appUserError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', data.user.id)
      .single();

    if (appUserError || !appUser) {
      throw new HttpError(403, 'User profile not found');
    }

    req.authUser = data.user;
    req.appUser = appUser;
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(roles: Array<'creator' | 'restaurant' | 'admin'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.appUser) {
      next(new HttpError(401, 'Unauthorized'));
      return;
    }

    if (!roles.includes(req.appUser.role)) {
      next(new HttpError(403, 'Forbidden'));
      return;
    }

    next();
  };
}
