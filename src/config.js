"use strict";

const ALLOWED_LOG_LEVELS = new Set(["error", "warn", "info"]);
const SNOWFLAKE_REGEX = /^\d{17,20}$/;

function getRequiredEnv(name, env) {
  const rawValue = env[name];
  const value = typeof rawValue === "string" ? rawValue.trim() : "";

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateSnowflake(name, value) {
  if (!SNOWFLAKE_REGEX.test(value)) {
    throw new Error(`${name} must be a valid Discord snowflake.`);
  }

  return value;
}

function loadConfig(env = process.env) {
  const token = getRequiredEnv("DISCORD_TOKEN", env);
  const guildId = validateSnowflake("GUILD_ID", getRequiredEnv("GUILD_ID", env));
  const autoRoleId = validateSnowflake("AUTO_ROLE_ID", getRequiredEnv("AUTO_ROLE_ID", env));

  const requestedLogLevel = (env.LOG_LEVEL || "info").toLowerCase().trim();

  if (!ALLOWED_LOG_LEVELS.has(requestedLogLevel)) {
    throw new Error(
      `LOG_LEVEL must be one of: ${Array.from(ALLOWED_LOG_LEVELS).join(", ")}.`
    );
  }

  return {
    token,
    guildId,
    autoRoleId,
    logLevel: requestedLogLevel,
  };
}

module.exports = {
  loadConfig,
  ALLOWED_LOG_LEVELS,
};
