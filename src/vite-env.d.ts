/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DISABLE_MOCK: string;
  readonly VITE_DISABLE_AUTO_API_INIT: string;
  // Add other environment variables as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 