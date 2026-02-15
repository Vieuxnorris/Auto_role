"use strict";

require("dotenv").config({ quiet: true });

const {
  Client,
  GatewayIntentBits,
  PermissionFlagsBits,
} = require("discord.js");

const { loadConfig } = require("./src/config");
const { createLogger } = require("./src/logger");

function formatError(error) {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

let config;

try {
  config = loadConfig();
} catch (error) {
  console.error(`${new Date().toISOString()} [ERROR] ${formatError(error)}`);
  process.exit(1);
}

const logger = createLogger(config.logLevel);

process.on("unhandledRejection", (reason) => {
  logger.error(`Unhandled rejection: ${formatError(reason)}`);
});

process.on("uncaughtException", (error) => {
  logger.error(`Uncaught exception: ${formatError(error)}`);
  process.exit(1);
});

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
});

client.once("clientReady", async () => {
  try {
    if (!client.user) {
      throw new Error("Client user is unavailable after login.");
    }

    const guild = await client.guilds.fetch(config.guildId);

    if (!guild) {
      throw new Error(`Guild ${config.guildId} was not found.`);
    }

    const [targetRole, botMember] = await Promise.all([
      guild.roles.fetch(config.autoRoleId),
      guild.members.fetchMe(),
    ]);

    if (!targetRole) {
      throw new Error(`Role ${config.autoRoleId} was not found in guild ${guild.id}.`);
    }

    if (targetRole.id === guild.roles.everyone.id) {
      throw new Error("AUTO_ROLE_ID cannot target the @everyone role.");
    }

    if (targetRole.managed) {
      throw new Error("AUTO_ROLE_ID targets an integration-managed role.");
    }

    if (!botMember.permissions.has(PermissionFlagsBits.ManageRoles)) {
      throw new Error("Bot is missing the Manage Roles permission.");
    }

    if (botMember.roles.highest.comparePositionTo(targetRole) <= 0) {
      throw new Error("Bot role must be above the target role in role hierarchy.");
    }

    logger.info(
      `Ready as ${client.user.tag}. Guild ${guild.id} and role ${targetRole.id} validated.`
    );
  } catch (error) {
    logger.error(`Startup validation failed: ${formatError(error)}`);
    process.exit(1);
  }
});

client.on("guildMemberAdd", async (member) => {
  if (member.guild.id !== config.guildId) {
    return;
  }

  if (member.user.bot) {
    logger.info(`Ignored bot member ${member.id}.`);
    return;
  }

  if (member.roles.cache.has(config.autoRoleId)) {
    logger.info(`Member ${member.id} already has role ${config.autoRoleId}.`);
    return;
  }

  try {
    await member.roles.add(config.autoRoleId, "Auto role on member join");
    logger.info(`Assigned role ${config.autoRoleId} to member ${member.id}.`);
  } catch (error) {
    logger.error(
      `Failed to assign role ${config.autoRoleId} to member ${member.id}: ${formatError(error)}`
    );
  }
});

client.on("error", (error) => {
  logger.error(`Discord client error: ${formatError(error)}`);
});

client.on("shardError", (error) => {
  logger.error(`Discord shard error: ${formatError(error)}`);
});

client.login(config.token).catch((error) => {
  logger.error(`Login failed: ${formatError(error)}`);
  process.exit(1);
});
