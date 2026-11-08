import { ServerInput } from '@/types';

export const MIN_SERVERS = 2;
export const MAX_SERVERS = 10;
export const MIN_EMISSION = 0;
export const MAX_EMISSION = 100;

export interface ServerValidationResult {
  isValid: boolean;
  errors: Record<number, string>;
  countError: string | null;
}

/**
 * Validates the fleet size count.
 */
export function validateServerCount(count: number): string | null {
  if (!Number.isFinite(count) || !Number.isInteger(count)) {
    return 'Server count must be a whole number.';
  }
  if (count < MIN_SERVERS) {
    return `Minimum ${MIN_SERVERS} servers are required.`;
  }
  if (count > MAX_SERVERS) {
    return `Maximum ${MAX_SERVERS} servers are supported.`;
  }
  return null;
}

/**
 * Validates an individual server's CO2 emission value (0 to 100).
 */
export function validateEmission(value: number | ''): string | null {
  if (value === '' || value === null || value === undefined) {
    return 'Emission value is required.';
  }
  const numeric = Number(value);
  if (isNaN(numeric) || !Number.isFinite(numeric)) {
    return 'Emission must be a valid number.';
  }
  if (numeric < MIN_EMISSION) {
    return `CO₂ emission cannot be negative (min: ${MIN_EMISSION}).`;
  }
  if (numeric > MAX_EMISSION) {
    return `CO₂ emission cannot exceed ${MAX_EMISSION}.`;
  }
  return null;
}

/**
 * Validates the full array of dynamic server inputs.
 */
export function validateServerInputs(servers: ServerInput[]): ServerValidationResult {
  const countError = validateServerCount(servers.length);
  const errors: Record<number, string> = {};

  servers.forEach((s) => {
    const err = validateEmission(s.emission);
    if (err) {
      errors[s.id] = err;
    }
  });

  const isValid = !countError && Object.keys(errors).length === 0;

  return {
    isValid,
    errors,
    countError,
  };
}
