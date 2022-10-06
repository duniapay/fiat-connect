module.exports = {
  apps: [
    {
      name: `fiatconnect`,
      script: 'build/src/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      node_args: '--session-secret=hell, --auth-config-option=alfajores',
      env: {
        NODE_ENV: 'localhost',
      },
      env_development: {
        NODE_ENV: $NODE_ENV,
        SESSION_SECRET: $SESSION_SECRET,
        AUTH_CONFIG_OPTION: $AUTH_CONFIG_OPTION,
      },
      env_staging: {
        NODE_ENV: process.env.NODE_ENV,
        SESSION_SECRET: $SESSION_SECRET,
        AUTH_CONFIG_OPTION: $AUTH_CONFIG_OPTION,
      },
      env_production: {
        NODE_ENV: process.env.NODE_ENV,
        SESSION_SECRET: $SESSION_SECRET,
        AUTH_CONFIG_OPTION: $AUTH_CONFIG_OPTION,
      },
    },
  ],
}
