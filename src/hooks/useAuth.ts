import { create } from 'zustand';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  getProfile,
  type Profile,
} from '@/lib/api';
import { clearToken, getToken, initializeToken } from '@/lib/api-client';

interface AuthState {
  token: string | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: string | null; role?: string }>;
  signUp: (
    email: string,
    password: string,
    metadata: Record<string, string>
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  profile: null,
  loading: true,
  initialized: false,

  init: async () => {
    try {
      await initializeToken();
      const token = getToken();

      if (!token) {
        set({ loading: false, initialized: true, token: null, profile: null });
        return;
      }

      try {
        const profile = await getProfile();
        set({ token, profile, loading: false, initialized: true });
      } catch {
        clearToken();
        set({
          token: null,
          profile: null,
          loading: false,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Auth init error:', error);
      set({ loading: false, initialized: true });
    }
  },

  refreshProfile: async () => {
    try {
      const profile = await getProfile();
      set({ profile });
    } catch {
      clearToken();
      set({ token: null, profile: null });
    }
  },

  signIn: async (email, password) => {
    try {
      const res = await apiSignIn(email, password);
      set({ token: getToken(), profile: res.user });
      return { error: null, role: res.user.role };
    } catch (err: any) {
      return { error: err.message || 'Invalid email or password' };
    }
  },

  signUp: async (email, password, metadata) => {
    try {
      const res = await apiSignUp({
        email,
        password,
        firstName: metadata.first_name || metadata.firstName || '',
        lastName: metadata.last_name || metadata.lastName || '',
        role: metadata.role || 'customer',
        phone: metadata.phone,
        vehicleType: metadata.vehicle_type || metadata.vehicleType,
        vehicleRegistration:
          metadata.van_registration || metadata.vehicleRegistration,
        licenseFront: metadata.license_front || metadata.licenseFront,
        licenseBack: metadata.license_back || metadata.licenseBack,
        insuranceCertUrl:
          metadata.insurance_cert_url || metadata.insuranceCertUrl,
        vehicleRegDocUrl:
          metadata.vehicle_reg_doc || metadata.vehicleRegDocUrl,
        bankIban: metadata.bank_iban || metadata.bankIban,
        bankBic: metadata.bank_bic || metadata.bankBic,
        bankAccountHolder:
          metadata.bank_account_holder || metadata.bankAccountHolder,
      });
      set({ token: getToken(), profile: res.user });
      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Signup failed' };
    }
  },

  signOut: async () => {
    apiSignOut();
    set({ token: null, profile: null });
  },
}));
