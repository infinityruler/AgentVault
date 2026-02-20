import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

const router = Router();

const createClaimSchema = z.object({
  offer_id: z.string().uuid(),
  expires_at: z.string().datetime().optional()
});

const listSchema = z.object({
  creator_id: z.string().uuid().optional()
});

const updateSchema = z.object({
  status: z.enum(['active', 'submitted', 'approved', 'rejected', 'expired'])
});

async function releaseOfferSlot(claimId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('release_offer_slot', { p_claim_id: claimId });
  if (error) {
    throw new HttpError(400, error.message);
  }
}

router.post(
  '/',
  requireAuth,
  requireRole(['creator']),
  asyncHandler(async (req, res) => {
    const payload = createClaimSchema.parse(req.body);

    const expiresAt = payload.expires_at
      ? new Date(payload.expires_at).toISOString()
      : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin.rpc('claim_offer', {
      p_offer_id: payload.offer_id,
      p_creator_id: req.appUser!.id,
      p_expires_at: expiresAt
    });

    if (error) {
      throw new HttpError(400, error.message);
    }

    res.status(201).json(data);
  })
);

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const query = listSchema.parse(req.query);

    let creatorId = query.creator_id;
    if (req.appUser!.role === 'creator') {
      creatorId = req.appUser!.id;
    } else if (!creatorId && req.appUser!.role !== 'admin') {
      throw new HttpError(400, 'creator_id is required for non-admin non-creator users');
    }

    const { data, error } = await supabaseAdmin
      .from('claims')
      .select('*, offers(*)')
      .eq('creator_id', creatorId!)
      .order('claimed_at', { ascending: false });

    if (error) {
      throw new HttpError(400, error.message);
    }

    res.json(data ?? []);
  })
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const payload = updateSchema.parse(req.body);

    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claims')
      .select('*, offers!inner(restaurant_id)')
      .eq('id', req.params.id)
      .single();

    if (claimErr || !claim) {
      throw new HttpError(404, 'Claim not found');
    }

    const isOwner = claim.creator_id === req.appUser!.id;
    const isRestaurantOwner = claim.offers.restaurant_id === req.appUser!.id;
    const isAdmin = req.appUser!.role === 'admin';

    if (!isOwner && !isRestaurantOwner && !isAdmin) {
      throw new HttpError(403, 'Forbidden');
    }

    const oldStatus = claim.status;
    const newStatus = payload.status;

    const { data, error } = await supabaseAdmin
      .from('claims')
      .update({ status: newStatus })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to update claim');
    }

    const shouldRelease =
      (newStatus === 'rejected' || newStatus === 'expired') &&
      (oldStatus === 'active' || oldStatus === 'submitted');

    if (shouldRelease) {
      await releaseOfferSlot(req.params.id);
    }

    res.json(data);
  })
);

export default router;
