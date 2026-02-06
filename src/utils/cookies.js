// Utility function to set a partitioned cookie
export function setPartitionedCookie(name, value) {
  if (typeof document !== 'undefined') {
    document.cookie = `${name}=${value}; Path=/; Secure; SameSite=None; Partitioned`;
  }
}

// Example usage in an Astro component frontmatter:
/*
---
// Server-side usage (if using SSR adapter)
if (Astro.cookies) {
  Astro.cookies.set('session_id', '12345', {
    partitioned: true,
    secure: true,
    sameSite: 'none'
  });
}
---
*/
