import { db } from '@/config/firebase';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { collection, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { Platform } from 'react-native';

// Configure notification behavior (from official docs)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PUSH_TOKENS_COLLECTION = 'pushTokens';

interface PushTokenDoc {
  userId: string;
  token: string;
  platform: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Register for push notifications (using EAS project ID)
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token = null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Job Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#4ECDC4',
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

    try {
      // Use the correct EAS project ID
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? 'a982f974-2c28-43d8-a920-f7ba93ee57be';
      
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      
      token = pushTokenData.data;
      console.log('Push token:', token);
      
    } catch (e) {
      console.error('Error getting push token:', e);
      return null;
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Save push token to Firestore
export async function savePushToken(userId: string, token: string): Promise<void> {
  try {
    const tokenDocRef = doc(db, 'pushTokens', userId);
    const tokenDoc = await getDoc(tokenDocRef);
    if (!tokenDoc.exists()) {
      await setDoc(tokenDocRef, { token, platform: Platform.OS });
    }
  } catch (error) {
    console.error('Error saving push token:', error);
  }
}

// Get all push tokens for broadcasting
export async function getAllPushTokens(): Promise<string[]> {
  try {
    const tokensRef = collection(db, PUSH_TOKENS_COLLECTION);
    const querySnapshot = await getDocs(tokensRef);
    
    return querySnapshot.docs
      .map(doc => doc.data() as PushTokenDoc)
      .map(data => data.token)
      .filter(token => token && token.length > 0);
  } catch (error) {
    console.error('Error fetching push tokens:', error);
    return [];
  }
}

// Send push notification using Expo Push Service (from docs)
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

// Notify all users of new job
export async function notifyNewJob(jobId: string, jobTitle: string, company: string): Promise<void> {
  try {
    const tokens = await getAllPushTokens();
    
    if (tokens.length > 0) {
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
    }
  } catch (error) {
    console.error('Error sending new job notification:', error);
  }
}

// Notification event listeners (from docs)
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