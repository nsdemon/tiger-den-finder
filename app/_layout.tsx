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

  // iPhone / PWA: meta for Add to Home Screen, status bar, and safe area
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const themeColor = document.querySelector('meta[name="theme-color"]');
    if (!themeColor) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#2D0B6B';
      document.head.appendChild(meta);
    } else {
      (themeColor as HTMLMetaElement).content = '#2D0B6B';
    }
    const appleCapable = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleCapable) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
    const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleStatusBar) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'black-translucent';
      document.head.appendChild(meta);
    }
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && !(viewport as HTMLMetaElement).content.includes('viewport-fit')) {
      (viewport as HTMLMetaElement).content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    }
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
  }, []);

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
