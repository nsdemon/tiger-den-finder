// app/_layout.tsx
import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';
import { CookieConsent } from '@/components/CookieConsent';
import { trackVisitStart, trackVisitEnd, hasAnalyticsConsent } from '@/lib/analytics';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!hasAnalyticsConsent()) return;
    trackVisitStart();
    const onEnd = () => trackVisitEnd();
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onEnd();
    });
    window.addEventListener('pagehide', onEnd);
    return () => {
      window.removeEventListener('visibilitychange', onEnd);
      window.removeEventListener('pagehide', onEnd);
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/login" options={{ headerShown: false, presentation: 'modal' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
        <CookieConsent />
      </ThemeProvider>
    </AuthProvider>
  );
}
