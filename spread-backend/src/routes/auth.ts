import { Router } from 'express';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../config/supabase';
import { asyncHandler, HttpError } from '../utils/http';

const router = Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const signupSchema = authSchema.extend({
  role: z.enum(['creator', 'restaurant', 'admin']).default('creator'),
  instagram_handle: z.string().trim().min(1).optional(),
  tiktok_handle: z.string().trim().min(1).optional()
});

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const payload = signupSchema.parse(req.body);

    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password
    });

    if (error) {
      throw new HttpError(400, error.message);
    }

    const userId = data.user?.id;
    if (!userId) {
      throw new HttpError(500, 'Signup succeeded but user ID is missing');
    }

    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: userId,
        email: payload.email,
        role: payload.role,
        instagram_handle: payload.instagram_handle ?? null,
        tiktok_handle: payload.tiktok_handle ?? null,
        approval_status: payload.role === 'creator' ? 'pending' : 'approved'
      });

    if (insertError) {
      throw new HttpError(500, insertError.message);
    }

    res.status(201).json({
      message: 'Signup successful',
      user: data.user,
      session: data.session
    });
  })
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const payload = authSchema.parse(req.body);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: payload.email,
      password: payload.password
    });

    if (error) {
      throw new HttpError(401, error.message);
    }

    res.json({ message: 'Login successful', session: data.session, user: data.user });
  })
);

export default router;
