import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, TouchableOpacity } from 'react-native';

export function UserProfile() {
  const { user, logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: performLogout
        }
      ]
    );
  };

  const performLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      console.log('Logout completed successfully');
      // The AuthContext will handle the navigation automatically
    } catch (error: any) {
      console.error('Logout failed:', error);
      Alert.alert('Error', error.message || 'Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.userInfo}>
        <IconSymbol name="house.fill" size={48} color="#4ECDC4" />
        <ThemedText type="title" style={styles.name}>
          {user?.displayName || 'Contractor'}
        </ThemedText>
        <ThemedText style={styles.email}>{user?.email}</ThemedText>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.logoutButton, signingOut && styles.disabledButton]} 
        onPress={handleLogout}
        disabled={signingOut}
      >
        {signingOut ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
        )}
      </TouchableOpacity>

      {/* Debug info - remove in production */}
      <ThemedView style={styles.debugInfo}>
        <ThemedText style={styles.debugText}>
          User ID: {user?.uid || 'None'}
        </ThemedText>
        <ThemedText style={styles.debugText}>
          Auth Status: {user ? 'Signed In' : 'Signed Out'}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    gap: 30,
  },
  userInfo: {
    alignItems: 'center',
    gap: 12,
  },
  name: {
    marginTop: 8,
  },
  email: {
    opacity: 0.7,
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  debugInfo: {
    marginTop: 20,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 8,
    alignItems: 'center',
  },
  debugText: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
}); 