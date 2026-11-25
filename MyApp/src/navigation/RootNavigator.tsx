import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AppNavigator from './AppNavigator';
import AuthNavigator from './AuthNavigator';
import LoadingScreen from '../components/LoadingScreen';
import Colors from '../theme/colors';

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <>
        <StatusBar barStyle="light-content" {...({ backgroundColor: Colors.background } as any)} />
        <LoadingScreen />
      </>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" {...({ backgroundColor: Colors.background } as any)} />
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;
