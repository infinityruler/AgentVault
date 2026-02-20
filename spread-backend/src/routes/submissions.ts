import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

const router = Router();

const createSubmissionSchema = z.object({
  claim_id: z.string().uuid(),
  tiktok_url: z.string().url().optional(),
  caption_text: z.string().optional(),
  image_base64: z.string().min(1),
  image_mime_type: z.enum(['image/jpeg', 'image/png', 'image/webp'])
});

const queueSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

function decodeBase64(input: string): Buffer {
  const normalized = input.includes(',') ? input.split(',')[1] : input;
  return Buffer.from(normalized, 'base64');
}

function extFromMime(mime: string): string {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/webp') return 'webp';
  return 'jpg';
}

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
    const payload = createSubmissionSchema.parse(req.body);

    const { data: claim, error: claimErr } = await supabaseAdmin
      .from('claims')
      .select('*')
      .eq('id', payload.claim_id)
      .single();

    if (claimErr || !claim) {
      throw new HttpError(404, 'Claim not found');
    }

    if (claim.creator_id !== req.appUser!.id) {
      throw new HttpError(403, 'Forbidden');
    }

    if (!['active', 'submitted'].includes(claim.status)) {
      throw new HttpError(400, 'Claim is not eligible for submission');
    }

    const extension = extFromMime(payload.image_mime_type);
    const filePath = `${req.appUser!.id}/${payload.claim_id}-${Date.now()}.${extension}`;
    const fileBuffer = decodeBase64(payload.image_base64);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(env.SUPABASE_STORAGE_BUCKET)
      .upload(filePath, fileBuffer, {
        contentType: payload.image_mime_type,
        upsert: false
      });

    if (uploadError) {
      throw new HttpError(400, uploadError.message);
    }

    const {
      data: { publicUrl }
    } = supabaseAdmin.storage.from(env.SUPABASE_STORAGE_BUCKET).getPublicUrl(filePath);

    const { data: submission, error: insertError } = await supabaseAdmin
      .from('submissions')
      .insert({
        claim_id: payload.claim_id,
        proof_image_url: publicUrl,
        tiktok_url: payload.tiktok_url ?? null,
        caption_text: payload.caption_text ?? null,
        status: 'pending'
      })
      .select('*')
      .single();

    if (insertError || !submission) {
      throw new HttpError(400, insertError?.message ?? 'Unable to create submission');
    }

    await supabaseAdmin.from('claims').update({ status: 'submitted' }).eq('id', payload.claim_id);

    res.status(201).json(submission);
  })
);

router.get(
  '/',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const { status } = queueSchema.parse(req.query);

    let query = supabaseAdmin
      .from('submissions')
      .select('*, claims!inner(*, offers!inner(restaurant_id))')
      .eq('status', status)
      .order('id', { ascending: false });

    if (req.appUser!.role === 'restaurant') {
      query = query.eq('claims.offers.restaurant_id', req.appUser!.id);
    }

    const { data, error } = await query;
    if (error) {
      throw new HttpError(400, error.message);
    }

    res.json(data ?? []);
  })
);

router.patch(
  '/:id/approve',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const { data: submission, error: submissionErr } = await supabaseAdmin
      .from('submissions')
      .select('*, claims!inner(*, offers!inner(restaurant_id))')
      .eq('id', req.params.id)
      .single();

    if (submissionErr || !submission) {
      throw new HttpError(404, 'Submission not found');
    }

    const isAdmin = req.appUser!.role === 'admin';
    const isRestaurantOwner = submission.claims.offers.restaurant_id === req.appUser!.id;
    if (!isAdmin && !isRestaurantOwner) {
      throw new HttpError(403, 'Forbidden');
    }

    if (submission.status !== 'pending') {
      throw new HttpError(400, 'Submission already reviewed');
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .update({
        status: 'approved',
        reviewed_by: req.appUser!.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to approve submission');
    }

    await supabaseAdmin.from('claims').update({ status: 'approved' }).eq('id', submission.claim_id);
    await releaseOfferSlot(submission.claim_id);

    res.json(data);
  })
);

router.patch(
  '/:id/reject',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const { data: submission, error: submissionErr } = await supabaseAdmin
      .from('submissions')
      .select('*, claims!inner(*, offers!inner(restaurant_id))')
      .eq('id', req.params.id)
      .single();

    if (submissionErr || !submission) {
      throw new HttpError(404, 'Submission not found');
    }

    const isAdmin = req.appUser!.role === 'admin';
    const isRestaurantOwner = submission.claims.offers.restaurant_id === req.appUser!.id;
    if (!isAdmin && !isRestaurantOwner) {
      throw new HttpError(403, 'Forbidden');
    }

    if (submission.status !== 'pending') {
      throw new HttpError(400, 'Submission already reviewed');
    }

    const { data, error } = await supabaseAdmin
      .from('submissions')
      .update({
        status: 'rejected',
        reviewed_by: req.appUser!.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to reject submission');
    }

    await supabaseAdmin.from('claims').update({ status: 'rejected' }).eq('id', submission.claim_id);
    await releaseOfferSlot(submission.claim_id);

    res.json(data);
  })
);

export default router;
