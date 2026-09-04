export type AuthRole = 'customer' | 'driver';

export type AuthStackParamList = {
  Landing: undefined;
  Login: { role: AuthRole };
  Signup: { role: AuthRole };
};
