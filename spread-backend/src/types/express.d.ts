import { User } from '@supabase/supabase-js';

declare global {
  namespace Express {
    interface Request {
      authUser?: User;
      appUser?: {
        id: string;
        role: 'creator' | 'restaurant' | 'admin';
      };
    }
  }
}

export {};
