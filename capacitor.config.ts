import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cl.educantay.app',
  appName: 'EducAntay',
  webDir: 'public',
  server: {
    url: 'https://educantay.cl',
    cleartext: false,
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: false
  }
};

export default config;
