import React, { useEffect } from 'react';
import { LinkingOptions, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { StripeProvider } from '@stripe/stripe-react-native';
import { useAuth } from '@/hooks/useAuth';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';
import LoginScreen from '@/screens/LoginScreen';
import AccountScreen from '@/screens/AccountScreen';
import LandingScreen from '@/screens/LandingScreen';
import SignupScreen from '@/screens/SignupScreen';
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
import CustomerHomeScreen from '@/screens/CustomerHomeScreen';
import BookDeliveryScreen from '@/screens/BookDeliveryScreen';
import DeliveriesListScreen from '@/screens/DeliveriesListScreen';
import NotificationsScreen from '@/screens/NotificationsScreen';
import WalletScreen from '@/screens/WalletScreen';
import DevQaScreen from '@/screens/DevQaScreen';
import DriverHomeScreen from '@/screens/DriverHomeScreen';
import DriverJobsScreen from '@/screens/DriverJobsScreen';
import JobDetailsScreen from '@/screens/JobDetailsScreen';
import ActiveJobScreen from '@/screens/ActiveJobScreen';
import RouteScreen from '@/screens/RouteScreen';
import type {
  AuthStackParamList,
  CustomerStackParamList,
  CustomerTabParamList,
  DriverStackParamList,
  DriverTabParamList,
} from '@/types/navigation';

type RootStackParamList = {
  DriverNavigator: undefined;
  CustomerNavigator: undefined;
  Auth: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const CustomerStack = createNativeStackNavigator<CustomerStackParamList>();
const DriverStack = createNativeStackNavigator<DriverStackParamList>();
const CustomerTab = createBottomTabNavigator<CustomerTabParamList>();
const DriverTab = createBottomTabNavigator<DriverTabParamList>();

const HeaderBackButton = ({ label = '< Back', onPress }: { label?: string; onPress: () => void }) => (
  <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={{ paddingRight: 16 }}>
    <Text style={{ color: '#111827', fontSize: 16, fontWeight: '700' }}>{label}</Text>
  </TouchableOpacity>
);

const CustomerJobDetailsScreen = (
  props: NativeStackScreenProps<CustomerStackParamList, 'JobDetails'>
) => <JobDetailsScreen {...props} />;

const DriverJobDetailsScreen = (
  props: NativeStackScreenProps<DriverStackParamList, 'JobDetails'>
) => <JobDetailsScreen {...props} />;

const CustomerWorkStack = () => (
  <CustomerStack.Navigator>
    <CustomerStack.Screen
      name="CustomerHome"
      component={CustomerHomeScreen}
      options={{ title: 'Customer Home' }}
    />
    <CustomerStack.Screen
      name="BookDelivery"
      component={BookDeliveryScreen}
      options={{ title: 'Book Delivery' }}
    />
    <CustomerStack.Screen
      name="Deliveries"
      component={DeliveriesListScreen}
      options={{ title: 'Deliveries' }}
    />
    <CustomerStack.Screen
      name="JobDetails"
      component={CustomerJobDetailsScreen}
      options={{ title: 'Delivery Details' }}
    />
    {__DEV__ ? (
      <CustomerStack.Screen
        name="DevQa"
        options={{ title: 'QA Navigation' }}
      >
        {props => <DevQaScreen {...props} area="customer" />}
      </CustomerStack.Screen>
    ) : null}
  </CustomerStack.Navigator>
);

const DriverWorkStack = () => (
  <DriverStack.Navigator>
    <DriverStack.Screen
      name="DriverHome"
      component={DriverHomeScreen}
      options={{ title: 'Driver Home' }}
    />
    <DriverStack.Screen
      name="DriverJobs"
      component={DriverJobsScreen}
      options={{ title: 'Jobs' }}
    />
    <DriverStack.Screen
      name="JobDetails"
      component={DriverJobDetailsScreen}
      options={{ title: 'Job Details' }}
    />
    <DriverStack.Screen
      name="ActiveJob"
      component={ActiveJobScreen}
      options={{ title: 'Active Job' }}
    />
    <DriverStack.Screen
      name="Route"
      component={RouteScreen}
      options={{ title: 'Route' }}
    />
    {__DEV__ ? (
      <DriverStack.Screen
        name="DevQa"
        options={{ title: 'QA Navigation' }}
      >
        {props => <DevQaScreen {...props} area="driver" />}
      </DriverStack.Screen>
    ) : null}
  </DriverStack.Navigator>
);

const CustomerNavigator = () => (
  <CustomerTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1f2937',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <CustomerTab.Screen
      name="CustomerWork"
      component={CustomerWorkStack}
      options={{
        tabBarLabel: 'Home',
      }}
    />
    <CustomerTab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        title: 'Account',
        tabBarLabel: 'Account',
      }}
    />
    <CustomerTab.Screen
      name="Wallet"
      component={WalletScreen}
      options={{
        title: 'Wallet',
        tabBarLabel: 'Wallet',
      }}
    />
    <CustomerTab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        title: 'Notifications',
        tabBarLabel: 'Alerts',
      }}
    />
  </CustomerTab.Navigator>
);

const DriverNavigator = () => (
  <DriverTab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: '#1f2937',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <DriverTab.Screen
      name="DriverWork"
      component={DriverWorkStack}
      options={{
        tabBarLabel: 'Home',
      }}
    />
    <DriverTab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        title: 'Account',
        tabBarLabel: 'Account',
      }}
    />
    <DriverTab.Screen
      name="Wallet"
      component={WalletScreen}
      options={{
        title: 'Wallet',
        tabBarLabel: 'Wallet',
      }}
    />
    <DriverTab.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{
        title: 'Notifications',
        tabBarLabel: 'Alerts',
      }}
    />
  </DriverTab.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: true,
      headerTitleStyle: {
        color: '#111827',
        fontSize: 17,
        fontWeight: '800',
      },
    }}
  >
    <AuthStack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
    <AuthStack.Screen
      name="Login"
      component={LoginScreen}
      options={({ navigation, route }) => ({
        title: route.params.role === 'driver' ? 'Driver login' : 'Customer login',
        headerBackVisible: false,
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Landing');
            }}
          />
        ),
      })}
    />
    <AuthStack.Screen
      name="Signup"
      component={SignupScreen}
      options={({ navigation, route }) => ({
        title: route.params.role === 'driver' ? 'Driver signup' : 'Customer signup',
        headerBackVisible: false,
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Landing');
            }}
          />
        ),
      })}
    />
    <AuthStack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
      options={({ navigation, route }) => ({
        title: 'Reset password',
        headerBackVisible: false,
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Login', { role: route.params.role });
            }}
          />
        ),
      })}
    />
    <AuthStack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
      options={({ navigation, route }) => ({
        title: 'Change password',
        headerBackVisible: false,
        headerLeft: () => (
          <HeaderBackButton
            onPress={() => {
              if (navigation.canGoBack()) navigation.goBack();
              else navigation.navigate('Login', { role: route.params.role ?? 'customer' });
            }}
          />
        ),
      })}
    />
    {__DEV__ ? (
      <AuthStack.Screen name="DevQa" options={{ title: 'QA Navigation' }}>
        {props => <DevQaScreen {...props} area="auth" />}
      </AuthStack.Screen>
    ) : null}
  </AuthStack.Navigator>
);

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['vanlink://', 'https://vanlink.app', 'https://www.vanlink.app'],
  config: {
    screens: {
      Auth: {
        screens: {
          ResetPassword: {
            path: 'reset-password/:token?',
            parse: {
              token: (token: string) => token,
            },
          },
          ForgotPassword: 'forgot-password',
          Login: 'login',
          Signup: 'signup',
          Landing: '',
        },
      },
      CustomerNavigator: 'customer',
      DriverNavigator: 'driver',
    },
  },
};

const App: React.FC = () => {
  const { token, profile, initialized, init } = useAuth();
  const isDriver = profile?.role === 'driver';

  useEffect(() => {
    init();
  }, [init]);

  if (!initialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY} urlScheme="vanlink">
      <NavigationContainer linking={linking}>
        <RootStack.Navigator
          screenOptions={{
            headerShown: true,
          }}
        >
          {token && isDriver ? (
            <RootStack.Screen
              name="DriverNavigator"
              component={DriverNavigator}
              options={{ headerShown: false }}
            />
          ) : token && profile ? (
            <RootStack.Screen
              name="CustomerNavigator"
              component={CustomerNavigator}
              options={{ headerShown: false }}
            />
          ) : (
            <RootStack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ headerShown: false }}
            />
          )}
        </RootStack.Navigator>
      </NavigationContainer>
    </StripeProvider>
  );
};

export default App;
