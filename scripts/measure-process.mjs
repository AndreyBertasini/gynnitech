// Preload: node --import ./scripts/measure-process.mjs <script> [args]
// Prints elapsed seconds and peak RSS of the measured process on exit.
process.on('exit', () => {
  const maxRssMb = (process.resourceUsage().maxRSS / 1024).toFixed(0);
  console.error(`MEASURE elapsed_s=${process.uptime().toFixed(1)} max_rss_mb=${maxRssMb}`);
});
