import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { NotificationData } from '@/constants/Notifications';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { JobProvider } from '@/contexts/JobContext';
import { useColorScheme } from '@/hooks/useColorScheme';

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { user, loading } = useAuth();
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  // Set up notification listeners
  useEffect(() => {
    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      const data = notification.request.content.data as NotificationData;
      
      // You can handle different notification types here
      if (data?.type === 'job_created') {
        console.log('New job notification received:', data);
      }
    });

    // This listener is fired whenever a user taps on or interacts with a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      const data = response.notification.request.content.data as NotificationData;
      
      // Navigate to specific screens based on notification data
      if (data?.jobId) {
        // Navigate to all jobs instead
        router.push(`/(tabs)/alljobs`);
      } else if (data?.type === 'job_created') {
        // Navigate to jobs list
        router.push('/(tabs)/alljobs');
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    console.log('Auth state effect:', { user: user?.email, loading });
    
    if (!loading) {
      if (user) {
        console.log('User is signed in, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('User is signed out, navigating to login');
        router.replace('/auth/login');
      }
    }
  }, [user, loading]);

  if (loading) {
    console.log('Auth is loading...');
    return null; // You could add a splash screen here
  }

  return (
    <JobProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/signup" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </JobProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
