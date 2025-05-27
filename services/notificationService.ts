import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getAllPushTokens } from './supabaseService';

// Configure notification behavior (from official docs)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Register for push notifications (following official Expo pattern)
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Job Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    // Learn more about projectId:
    // https://docs.expo.dev/push-notifications/push-notifications-setup/#configure-projectid
    // EAS projectId is used here.
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }
      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      console.log('✅ Expo push token obtained:', token);
    } catch (e) {
      console.error('❌ Error getting push token:', e);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Rest of your notification service remains the same...
export async function sendPushNotification(
  tokens: string[],
  title: string,
  body: string,
  data?: any
): Promise<void> {
  if (tokens.length === 0) return;

  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    priority: 'high' as const,
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    console.log('Push notification sent:', result);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
}

export async function notifyNewJob(jobId: string, jobTitle: string, company: string): Promise<void> {
  try {
    console.log('🚨 notifyNewJob called with:', { jobId, jobTitle, company });
    
    const tokens = await getAllPushTokens();
    console.log('📱 Found push tokens:', tokens.length, tokens);
    
    if (tokens.length > 0) {
      console.log('📤 Sending push notification...');
      await sendPushNotification(
        tokens,
        '🚨 New Job Available!',
        `${jobTitle} at ${company}`,
        {
          type: 'NEW_JOB',
          jobId,
          jobTitle,
          company,
        }
      );
      console.log('✅ Push notification sent successfully');
    } else {
      console.log('❌ No push tokens found - no notifications sent');
    }
  } catch (error) {
    console.error('❌ Error sending new job notification:', error);
  }
}

// Notification event listeners
export function addNotificationResponseReceivedListener(
  listener: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export function addNotificationReceivedListener(
  listener: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(listener);
}

export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return await Notifications.getLastNotificationResponseAsync();
}

const testCompleteLocalFlow = async () => {
  try {
    // Test immediate notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🚨 New Job Available!",
        body: "Test Job at Test Company",
        sound: 'default',
        data: {
          type: 'NEW_JOB',
          jobId: 'test-123',
          jobTitle: 'Test Job',
          company: 'Test Company',
        },
      },
      trigger: { seconds: 2 },
    });
    
    console.log('✅ Local notification scheduled');
  } catch (error) {
    console.error('❌ Local notification failed:', error);
  }
};