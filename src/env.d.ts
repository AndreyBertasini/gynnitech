/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    // (3s support removed)
  }
}

declare module 'sql.js' {
  export type SqlValue = string | number | Uint8Array | null;

  export interface QueryExecResult {
    columns: string[];
    values: SqlValue[][];
  }

  export interface Database {
    run(sql: string): void;
    exec(sql: string): QueryExecResult[];
    close(): void;
  }

  export interface SqlJsStatic {
    Database: new () => Database;
  }

  export interface SqlJsConfig {
    locateFile?: (file: string) => string;
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>;
}

type GoogleConsentValue = 'granted' | 'denied';

type GoogleConsentState = {
  ad_storage?: GoogleConsentValue;
  ad_user_data?: GoogleConsentValue;
  ad_personalization?: GoogleConsentValue;
  analytics_storage?: GoogleConsentValue;
};

type GinnyTechGtag = {
  (command: 'consent', action: 'default' | 'update', consent: GoogleConsentState): void;
  (command: 'js', date: Date): void;
  (command: 'config', measurementId: string): void;
};

interface Window {
  dataLayer?: unknown[];
  gtag?: GinnyTechGtag;
  __ginnytechGaLoaded?: boolean;
  ginnytechOpenCookiePreferences?: () => void;
}

declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const url: string;
  export default url;
}
