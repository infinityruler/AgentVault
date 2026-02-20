import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

const router = Router();

const updateSchema = z.object({
  instagram_handle: z.string().trim().nullable().optional(),
  tiktok_handle: z.string().trim().nullable().optional(),
  approval_status: z.enum(['pending', 'approved', 'rejected']).optional(),
  role: z.enum(['creator', 'restaurant', 'admin']).optional()
});

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (req.appUser!.id !== id && req.appUser!.role !== 'admin') {
      throw new HttpError(403, 'Forbidden');
    }

    const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', id).single();
    if (error || !data) {
      throw new HttpError(404, 'User not found');
    }

    res.json(data);
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = updateSchema.parse(req.body);

    if (req.appUser!.id !== id && req.appUser!.role !== 'admin') {
      throw new HttpError(403, 'Forbidden');
    }

    if (req.appUser!.role !== 'admin') {
      delete updates.approval_status;
      delete updates.role;
    }

    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to update user');
    }

    res.json(data);
  })
);

export default router;
