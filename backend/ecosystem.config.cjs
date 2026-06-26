module.exports = {
  apps: [
    {
      name: "fullprep-backend",
      script: "./server.js",
      instances: "max",
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "1G",
      node_args: "--import ./instrument.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: "production",
      }
    }
  ]
};
