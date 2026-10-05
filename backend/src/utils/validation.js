const USER_TYPES = new Set(["renter", "owner", "both"]);
const EQUIPMENT_CATEGORIES = new Set(["Agriculture", "Construction"]);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isNonEmptyString(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maxLength;
}

function isValidEmail(value) {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

function isValidHttpUrl(value) {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > 2048) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

function parsePositiveInteger(value) {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

module.exports = {
  USER_TYPES,
  EQUIPMENT_CATEGORIES,
  isNonEmptyString,
  isValidEmail,
  isValidHttpUrl,
  parsePositiveInteger,
};
