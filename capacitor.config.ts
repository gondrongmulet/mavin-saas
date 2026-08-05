import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'id.mavin.saas',
  appName: 'MAVIN',
  webDir: 'dist',
  server: {
    url: 'https://mavin-saas.vercel.app',
    cleartext: true
  }
};

export default config;
