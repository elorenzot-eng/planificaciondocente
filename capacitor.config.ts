// Shared Capacitor configuration; Android tooling can read this without importing its CLI types.
const config = {
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
