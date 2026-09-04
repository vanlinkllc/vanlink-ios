import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import LoginScreen from '@/screens/LoginScreen';
import HomeScreen from '@/screens/HomeScreen';
import AccountScreen from '@/screens/AccountScreen';
import LandingScreen from '@/screens/LandingScreen';
import SignupScreen from '@/screens/SignupScreen';
import type { AuthStackParamList } from '@/types/navigation';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator();

const CustomerNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#1f2937',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Customer Home',
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        title: 'Account',
        tabBarLabel: 'Account',
      }}
    />
  </Tab.Navigator>
);

const DriverNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: true,
      tabBarActiveTintColor: '#1f2937',
      tabBarInactiveTintColor: '#9ca3af',
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        title: 'Driver Home',
        tabBarLabel: 'Home',
      }}
    />
    <Tab.Screen
      name="Account"
      component={AccountScreen}
      options={{
        title: 'Account',
        tabBarLabel: 'Account',
      }}
    />
  </Tab.Navigator>
);

const AuthNavigator = () => (
  <AuthStack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <AuthStack.Screen name="Landing" component={LandingScreen} />
    <AuthStack.Screen name="Login" component={LoginScreen} />
    <AuthStack.Screen name="Signup" component={SignupScreen} />
  </AuthStack.Navigator>
);

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
    <NavigationContainer>
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
  );
};

export default App;
