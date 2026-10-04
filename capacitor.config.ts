import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.obatra.ai',
  appName: 'obatra',
  webDir: 'capacitor-web',
  server: {
    url: 'https://obatra.vercel.app',
    cleartext: false
  }
};

export default config;
