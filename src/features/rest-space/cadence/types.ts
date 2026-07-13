import { defaultCadence, type RestCadencePreference } from '../preferences/defaults';

export type RestCadence = RestCadencePreference;

export type RestCadenceInput = Partial<Omit<RestCadence, 'id'>> & { id?: 'default' };

export function createRestCadence(input: RestCadenceInput = {}): RestCadence {
  const cadence: RestCadence = {
    ...defaultCadence,
    ...input,
    id: input.id ?? 'default',
  };

  validateRestCadence(cadence);
  return cadence;
}

export function validateRestCadence(cadence: RestCadence): void {
  if (cadence.workDurationMinutes < 15 || cadence.workDurationMinutes > 120) {
    throw new RangeError('workDurationMinutes must be between 15 and 120');
  }

  if (cadence.restDurationMinutes < 1 || cadence.restDurationMinutes > 30) {
    throw new RangeError('restDurationMinutes must be between 1 and 30');
  }

  if (cadence.postponeMinutes <= 0 || cadence.postponeMinutes >= cadence.workDurationMinutes) {
    throw new RangeError('postponeMinutes must be positive and shorter than workDurationMinutes');
  }
}