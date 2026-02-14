// Utility function to set a partitioned cookie
export function setPartitionedCookie(name, value) {
  if (typeof document !== 'undefined') {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; Path=/; Secure; SameSite=None; Partitioned`;
  }
}
