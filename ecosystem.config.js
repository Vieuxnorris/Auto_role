module.exports = {
  apps: [
    {
      name: "discord-auto-role-bot",
      script: "index.js",
      cwd: __dirname,
      watch: false,
      autorestart: true,
      restart_delay: 5000,
      max_restarts: 10,
      time: true,
      env: {
        NODE_ENV: "production",
        DISCORD_TOKEN: process.env.DISCORD_TOKEN,
        GUILD_ID: process.env.GUILD_ID,
        AUTO_ROLE_ID: process.env.AUTO_ROLE_ID,
        LOG_LEVEL: process.env.LOG_LEVEL || "info",
      },
    },
  ],
};
