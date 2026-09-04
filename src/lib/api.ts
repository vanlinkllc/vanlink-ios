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
  createdAt: string;
}

export interface CreateJobInput {
  pickupAddress: string;
  dropoffAddress: string;
  itemDescription: string;
  itemValue: number;
  budget: number;
  pricingModel: 'fixed' | 'bid';
  helpersRequired: number;
  vehicleClass?: string;
  scheduledTime?: string;
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

export async function forgotPassword(email: string): Promise<void> {
  await api<void>('/auth/forgot-password', {
    method: 'POST',
    data: { email },
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

export async function fetchJobsForCustomer(): Promise<Job[]> {
  return api<Job[]>('/jobs/customer/all');
}

export async function fetchJobsForDriver(): Promise<Job[]> {
  return api<Job[]>('/jobs/driver/all');
}

export async function fetchAvailableJobs(
  driverLat = 53.3498,
  driverLng = -6.2603
): Promise<Job[]> {
  return api<Job[]>('/jobs/available', {
    params: { driverLat, driverLng },
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

export async function fetchActiveDriverJobs(): Promise<Job[]> {
  return api<Job[]>('/jobs/my/active');
}

export async function completeJob(jobId: string): Promise<Job> {
  return api<Job>(`/jobs/${jobId}/complete`, {
    method: 'POST',
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
