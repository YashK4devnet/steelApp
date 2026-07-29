import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fourdevnet.steelapp',
  appName: 'Steel App',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT'
    },
    CapacitorHttp: {
      enabled: true
    },
    CapacitorCookies: {
      enabled: true
    }
  }
};

export default config;
