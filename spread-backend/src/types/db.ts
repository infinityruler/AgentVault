export type UserRole = 'creator' | 'restaurant' | 'admin';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ClaimStatus = 'active' | 'submitted' | 'approved' | 'rejected' | 'expired';
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface AppUser {
  id: string;
  email: string;
  role: UserRole;
  instagram_handle: string | null;
  tiktok_handle: string | null;
  approval_status: ApprovalStatus;
  created_at: string;
}

export interface Offer {
  id: string;
  restaurant_id: string;
  title: string;
  description: string | null;
  location_lat: number;
  location_lng: number;
  max_concurrent_creators: number;
  current_active_creators: number;
  expiration_date: string;
  active: boolean;
  created_at: string;
}

export interface Claim {
  id: string;
  offer_id: string;
  creator_id: string;
  status: ClaimStatus;
  claimed_at: string;
  expires_at: string;
}

export interface Submission {
  id: string;
  claim_id: string;
  proof_image_url: string;
  tiktok_url: string | null;
  caption_text: string | null;
  status: SubmissionStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
}
