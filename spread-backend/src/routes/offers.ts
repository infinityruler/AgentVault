import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../config/supabase';
import { requireAuth, requireRole } from '../middleware/auth';
import { asyncHandler, HttpError } from '../utils/http';

const router = Router();

const createOfferSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  location_lat: z.number().min(-90).max(90),
  location_lng: z.number().min(-180).max(180),
  max_concurrent_creators: z.number().int().min(1),
  expiration_date: z.string().datetime()
});

const updateOfferSchema = createOfferSchema.partial().extend({
  active: z.boolean().optional(),
  current_active_creators: z.number().int().min(0).optional()
});

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  radius: z.coerce.number().positive().optional(),
  open_slots: z.coerce.boolean().optional()
});

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const r = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.post(
  '/',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const payload = createOfferSchema.parse(req.body);
    const restaurantId = req.appUser!.id;

    const { data, error } = await supabaseAdmin
      .from('offers')
      .insert({
        ...payload,
        restaurant_id: restaurantId
      })
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to create offer');
    }

    res.status(201).json(data);
  })
);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const query = querySchema.parse(req.query);
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('active', true)
      .gt('expiration_date', nowIso)
      .order('created_at', { ascending: false });

    if (error) {
      throw new HttpError(400, error.message);
    }

    let offers = data ?? [];

    if (query.open_slots) {
      offers = offers.filter((offer) => offer.current_active_creators < offer.max_concurrent_creators);
    }

    if (query.lat !== undefined && query.lng !== undefined && query.radius !== undefined) {
      offers = offers.filter((offer) => {
        const d = distanceKm(query.lat!, query.lng!, offer.location_lat, offer.location_lng);
        return d <= query.radius!;
      });
    }

    res.json(offers);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !data) {
      throw new HttpError(404, 'Offer not found');
    }

    res.json(data);
  })
);

router.patch(
  '/:id',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const payload = updateOfferSchema.parse(req.body);

    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (existingErr || !existing) {
      throw new HttpError(404, 'Offer not found');
    }

    if (req.appUser!.role !== 'admin' && existing.restaurant_id !== req.appUser!.id) {
      throw new HttpError(403, 'Forbidden');
    }

    const { data, error } = await supabaseAdmin
      .from('offers')
      .update(payload)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error || !data) {
      throw new HttpError(400, error?.message ?? 'Unable to update offer');
    }

    res.json(data);
  })
);

router.delete(
  '/:id',
  requireAuth,
  requireRole(['restaurant', 'admin']),
  asyncHandler(async (req, res) => {
    const { data: existing, error: existingErr } = await supabaseAdmin
      .from('offers')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (existingErr || !existing) {
      throw new HttpError(404, 'Offer not found');
    }

    if (req.appUser!.role !== 'admin' && existing.restaurant_id !== req.appUser!.id) {
      throw new HttpError(403, 'Forbidden');
    }

    const { error } = await supabaseAdmin.from('offers').delete().eq('id', req.params.id);
    if (error) {
      throw new HttpError(400, error.message);
    }

    res.status(204).send();
  })
);

export default router;
