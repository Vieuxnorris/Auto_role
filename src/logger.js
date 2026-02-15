"use strict";

const LEVEL_PRIORITY = {
  error: 0,
  warn: 1,
  info: 2,
};

function toMessage(value) {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}`;
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return String(value);
  }
}

function createLogger(level = "info") {
  const selectedLevel = LEVEL_PRIORITY[level] ?? LEVEL_PRIORITY.info;

  function write(levelName, label, message) {
    if (LEVEL_PRIORITY[levelName] > selectedLevel) {
      return;
    }

    const line = `${new Date().toISOString()} ${label} ${toMessage(message)}`;

    if (levelName === "error") {
      console.error(line);
      return;
    }

    if (levelName === "warn") {
      console.warn(line);
      return;
    }

    console.log(line);
  }

  return {
    info(message) {
      write("info", "[INFO]", message);
    },
    warn(message) {
      write("warn", "[WARN]", message);
    },
    error(message) {
      write("error", "[ERROR]", message);
    },
  };
}

module.exports = {
  createLogger,
};
