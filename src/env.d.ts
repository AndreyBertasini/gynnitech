/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module 'sql.js';
declare module 'sql.js/dist/sql-wasm.wasm?url' {
  const url: string;
  export default url;
}
