import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthRole = 'customer' | 'driver';

export type AuthStackParamList = {
  Landing: undefined;
  Login: { role: AuthRole };
  Signup: { role: AuthRole };
  ForgotPassword: { role: AuthRole };
  ResetPassword: { role?: AuthRole; email?: string; token?: string };
  DevQa: undefined;
};

export type CustomerStackParamList = {
  CustomerHome: undefined;
  BookDelivery: undefined;
  Deliveries: undefined;
  JobDetails: { jobId: string; mode?: 'customer' };
  DevQa: undefined;
};

export type DriverStackParamList = {
  DriverHome: undefined;
  DriverJobs: { list: 'available' | 'mine' };
  JobDetails: { jobId: string; mode?: 'driver' };
  ActiveJob: undefined;
  Route: { jobId: string };
  DevQa: undefined;
};

export type CustomerTabParamList = {
  CustomerWork: NavigatorScreenParams<CustomerStackParamList>;
  Wallet: undefined;
  Notifications: undefined;
  Account: undefined;
};

export type DriverTabParamList = {
  DriverWork: NavigatorScreenParams<DriverStackParamList>;
  Wallet: undefined;
  Notifications: undefined;
  Account: undefined;
};
