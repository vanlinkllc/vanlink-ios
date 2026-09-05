import { api, setToken, clearToken } from './api-client';

export interface Profile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  vanlinkId: string;
  phone?: string;
  avatarUrl?: string;
  rating: number;
  totalRatings: number;
  jobsCompleted: number;
  acceptanceRate: number;
  cancellationRate: number;
  isVerified: boolean;
  verificationStatus?: string;
  isVlvSubscribed: boolean;
  subscriptionTier?: string;
  tier: string;
  xp: number;
  walletBalance: number;
  stripeAccountStatus?: string;
}

export interface Job {
  id: string;
  customerId: string;
  driverId?: string;
  status: string;
  pricingModel: string;
  budget: number;
  finalPrice?: number;
  pickupAddress: string;
  dropoffAddress: string;
  itemDescription: string;
  itemValue: number;
  itemPhotos: string[];
  vehicleClass?: string;
  helpersRequired: number;
  scheduledTime?: string;
  createdAt: string;
  updatedAt: string;
  customer?: Profile;
  driver?: Profile;
  bids?: Bid[];
  driverLat?: number;
  driverLng?: number;
  navPhase?: string;
  paymentStatus?: string;
}

export interface Bid {
  id: string;
  jobId: string;
  driverId: string;
  amount: number;
  message?: string;
  status: string;
  createdAt: string;
  driver?: Profile;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  status: string;
  description?: string;
  jobId?: string;
  paymentMethod?: string;
  reference?: string;
  clientSecret?: string | null;
  message?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface CreateJobInput {
  pickupAddress: string;
  pickupLat?: number;
  pickupLng?: number;
  pickupEircode?: string;
  dropoffAddress: string;
  dropoffLat?: number;
  dropoffLng?: number;
  dropoffEircode?: string;
  distanceKm?: number;
  itemDescription: string;
  itemValue: number;
  itemPhotos?: string[];
  budget: number;
  pricingModel: 'fixed' | 'bid';
  helpersRequired: number;
  vehicleClass?: string;
  scheduledTime?: string;
  hasElevator?: boolean;
  deliveryTier?: 'same_day' | '2_hour' | '1_hour';
  bonusPercent?: number;
  isSameDay?: boolean;
  stripePaymentIntentId?: string;
}

export interface DriverLocationParams {
  driverLat: number;
  driverLng: number;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface MessageResponse {
  message: string;
}

export interface PaymentIntentResponse {
  clientSecret: string | null;
  paymentIntentId: string | null;
  walletOnly: boolean;
  walletContribution: number;
  cardCharge: number;
  totalAmount: number;
}

export interface StripeConnectStatus {
  status: 'none' | 'pending' | 'verified' | string;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements?: string[];
}

export interface StripeConnectOnboarding {
  url: string;
  accountId: string;
}

export interface StripeConnectAccountSession {
  clientSecret: string;
  accountId: string;
}

export interface VlvStatus {
  isVlvSubscribed: boolean;
  subscriptionTier?: string | null;
  currentPeriodEnd?: string | null;
  price: number;
}

export interface CheckoutSession {
  url: string | null;
  sessionId: string;
}

export interface PayoutResponse {
  payoutId?: string;
  amount: number;
  status?: string;
  feeAmount?: number;
  feePercent?: number;
  netAmount?: number;
}

// Auth endpoints
export async function signUp(data: Record<string, unknown>): Promise<{
  accessToken: string;
  user: Profile;
}> {
  const response = await api<{ accessToken: string; user: Profile }>(
    '/auth/signup',
    {
      method: 'POST',
      data,
    }
  );
  setToken(response.accessToken);
  return response;
}

export async function signIn(
  email: string,
  password: string
): Promise<{ accessToken: string; user: Profile }> {
  const response = await api<{ accessToken: string; user: Profile }>(
    '/auth/signin',
    {
      method: 'POST',
      data: { email, password },
    }
  );
  setToken(response.accessToken);
  return response;
}

export async function signOut(): Promise<void> {
  clearToken();
}

export async function forgotPassword(email: string): Promise<ForgotPasswordResponse> {
  return api<ForgotPasswordResponse>('/auth/forgot-password', {
    method: 'POST',
    data: { email },
  });
}

export async function sendEmailCode(email: string): Promise<MessageResponse> {
  return api<MessageResponse>('/auth/send-email-code', {
    method: 'POST',
    data: { email },
  });
}

export async function verifyEmailCode(
  email: string,
  code: string
): Promise<MessageResponse> {
  return api<MessageResponse>('/auth/verify-email-code', {
    method: 'POST',
    data: { email, code },
  });
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<void> {
  await api<void>('/auth/reset-password', {
    method: 'POST',
    data: { token, newPassword },
  });
}

export async function getProfile(): Promise<Profile> {
  return api<Profile>('/auth/me');
}

export async function updateProfile(
  updates: Record<string, unknown>
): Promise<Profile> {
  return api<Profile>('/auth/me', {
    method: 'PATCH',
    data: updates,
  });
}

// Job endpoints
export async function createJob(job: CreateJobInput): Promise<Job> {
  return api<Job>('/jobs', {
    method: 'POST',
    data: job,
  });
}

export async function createJobPaymentIntent(
  amount: number,
  jobDescription: string,
  jobId?: string
): Promise<PaymentIntentResponse> {
  return api<PaymentIntentResponse>('/stripe/payment-intent', {
    method: 'POST',
    data: { amount, jobDescription, jobId },
  });
}

export async function confirmJobPayment(
  jobId: string,
  paymentIntentId?: string | null
): Promise<Job> {
  return api<Job>(`/jobs/${jobId}/confirm-payment`, {
    method: 'POST',
    data: { paymentIntentId: paymentIntentId ?? null },
  });
}

export async function fetchJobsForCustomer(): Promise<Job[]> {
  return api<Job[]>('/jobs/customer/all');
}

export async function fetchJobsForDriver(): Promise<Job[]> {
  return api<Job[]>('/jobs/driver/all');
}

export async function fetchAvailableJobs(
  location: DriverLocationParams
): Promise<Job[]> {
  return api<Job[]>('/jobs/available', {
    params: location,
  });
}

export async function acceptJob(jobId: string): Promise<Job> {
  return api<Job>(`/jobs/${jobId}/accept`, {
    method: 'POST',
  });
}

export async function fetchJob(jobId: string): Promise<Job> {
  return api<Job>(`/jobs/${jobId}`);
}

export async function fetchActiveDriverJob(): Promise<Job | null> {
  return api<Job | null>('/jobs/my/active');
}

export async function completeJob(jobId: string): Promise<Job> {
  return api<Job>(`/jobs/${jobId}/complete`, {
    method: 'POST',
  });
}

export async function updateJobLocation(
  jobId: string,
  lat: number,
  lng: number,
  navPhase?: string
): Promise<Job> {
  return api<Job>(`/jobs/${jobId}/location`, {
    method: 'POST',
    data: { lat, lng, navPhase },
  });
}

export async function createBid(
  jobId: string,
  amount: number,
  message?: string
): Promise<Bid> {
  return api<Bid>(`/bids/job/${jobId}`, {
    method: 'POST',
    data: { amount, message },
  });
}

export async function fetchBidsForJob(jobId: string): Promise<Bid[]> {
  return api<Bid[]>(`/bids/job/${jobId}`);
}

export async function fetchMyBids(): Promise<Bid[]> {
  return api<Bid[]>('/bids/my');
}

// Notification endpoints
export async function fetchNotifications(): Promise<Notification[]> {
  return api<Notification[]>('/notifications');
}

export async function fetchUnreadNotificationCount(): Promise<{ count: number }> {
  return api<{ count: number }>('/notifications/unread-count');
}

export async function markNotificationRead(id: string): Promise<Notification> {
  return api<Notification>(`/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  return api<{ success: boolean }>('/notifications/read-all', {
    method: 'POST',
  });
}

export async function clearAllNotifications(): Promise<{ success: boolean }> {
  return api<{ success: boolean }>('/notifications/clear-all', {
    method: 'DELETE',
  });
}

// Wallet endpoints
export async function fetchWalletBalance(): Promise<{ balance: number }> {
  return api<{ balance: number }>('/wallet/balance');
}

export async function fetchWalletTransactions(): Promise<WalletTransaction[]> {
  return api<WalletTransaction[]>('/wallet/transactions');
}

export async function topUpWallet(
  amount: number,
  method: string
): Promise<WalletTransaction> {
  return api<WalletTransaction>('/wallet/topup', {
    method: 'POST',
    data: { amount, method },
  });
}

export async function confirmWalletTopUp(
  transactionId: string
): Promise<MessageResponse & { success: boolean }> {
  return api<MessageResponse & { success: boolean }>(
    `/wallet/topup/confirm/${transactionId}`,
    {
      method: 'POST',
    }
  );
}

export async function requestWalletPayout(
  amount: number,
  method: 'same_day' | 'weekly',
  iban?: string
): Promise<PayoutResponse> {
  return api<PayoutResponse>('/wallet/payout', {
    method: 'POST',
    data: { amount, method, iban },
  });
}

// Stripe endpoints. These expose only backend-created intents/sessions.
export async function createStripeConnectOnboarding(): Promise<StripeConnectOnboarding> {
  return api<StripeConnectOnboarding>('/stripe/connect/onboard', {
    method: 'POST',
  });
}

export async function createStripeConnectAccountSession(): Promise<StripeConnectAccountSession> {
  return api<StripeConnectAccountSession>('/stripe/connect/account-session', {
    method: 'POST',
  });
}

export async function fetchStripeConnectStatus(): Promise<StripeConnectStatus> {
  return api<StripeConnectStatus>('/stripe/connect/status');
}

export async function requestStripePayout(amount: number): Promise<PayoutResponse> {
  return api<PayoutResponse>('/stripe/payout', {
    method: 'POST',
    data: { amount },
  });
}

export async function fetchVlvStatus(): Promise<VlvStatus> {
  return api<VlvStatus>('/stripe/vlv/status');
}

export async function subscribeToVlv(): Promise<CheckoutSession> {
  return api<CheckoutSession>('/stripe/vlv/subscribe', {
    method: 'POST',
  });
}

export async function cancelVlvSubscription(): Promise<MessageResponse & { status: string }> {
  return api<MessageResponse & { status: string }>('/stripe/vlv/cancel', {
    method: 'POST',
  });
}
