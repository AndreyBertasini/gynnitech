/**
 * PM2 Ecosystem Config — Payload CMS (GinnyTech)
 *
 * Deploy sul VPS:
 *   cd /var/www/gynnitech/cms
 *   npm install && npm run build
 *   pm2 start ecosystem.config.cjs
 *   pm2 save && pm2 startup
 */
module.exports = {
  apps: [
    {
      name: 'gynnitech-cms',
      script: 'node_modules/.bin/next',
      args: 'start --port 3001',
      cwd: '/var/www/gynnitech/cms', // aggiusta con il tuo path VPS
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      error_file: '/var/log/pm2/gynnitech-cms-error.log',
      out_file: '/var/log/pm2/gynnitech-cms-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
}
