module.exports = {
  apps: [
    {
      name: 'gohealthy-api',
      script: './server.js',
      instances: 'max', // Uses all available CPU cores
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    }
  ]
};
