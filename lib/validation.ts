// Utility validation functions for models

export function isNonEmptyString(val: unknown): val is string {
  return typeof val === 'string' && val.trim().length > 0;
}

// Simple email regex validation
export function isValidEmail(val: unknown): val is string {
  if (typeof val !== 'string') return false;
  // RFC 5322 Official Standard, simplified
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(val.trim());
}

