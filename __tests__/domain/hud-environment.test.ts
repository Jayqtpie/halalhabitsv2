import { getEnvironmentForLevel, isEnvironmentTransition, ENVIRONMENT_NAMES } from '../../src/domain/hud-environment';
import type { EnvironmentId } from '../../src/domain/hud-environment';

describe('hud-environment', () => {
  describe('getEnvironmentForLevel', () => {
    it('returns quiet_study for levels 1-5', () => {
      expect(getEnvironmentForLevel(1)).toBe('quiet_study');
      expect(getEnvironmentForLevel(3)).toBe('quiet_study');
      expect(getEnvironmentForLevel(5)).toBe('quiet_study');
    });

    it('returns growing_garden for levels 6-11', () => {
      expect(getEnvironmentForLevel(6)).toBe('growing_garden');
      expect(getEnvironmentForLevel(8)).toBe('growing_garden');
      expect(getEnvironmentForLevel(11)).toBe('growing_garden');
    });

    it('returns scholars_courtyard for levels 12-19', () => {
      expect(getEnvironmentForLevel(12)).toBe('scholars_courtyard');
      expect(getEnvironmentForLevel(15)).toBe('scholars_courtyard');
      expect(getEnvironmentForLevel(19)).toBe('scholars_courtyard');
    });

    it('returns living_sanctuary for level 20+', () => {
      expect(getEnvironmentForLevel(20)).toBe('living_sanctuary');
      expect(getEnvironmentForLevel(50)).toBe('living_sanctuary');
      expect(getEnvironmentForLevel(99)).toBe('living_sanctuary');
    });
  });

  describe('isEnvironmentTransition', () => {
    it('detects boundary crossing 5→6', () => {
      expect(isEnvironmentTransition(5, 6)).toBe(true);
    });

    it('detects boundary crossing 11→12', () => {
      expect(isEnvironmentTransition(11, 12)).toBe(true);
    });

    it('returns false for same environment', () => {
      expect(isEnvironmentTransition(1, 5)).toBe(false);
      expect(isEnvironmentTransition(6, 11)).toBe(false);
    });
  });

  describe('ENVIRONMENT_NAMES', () => {
    it('has display names for all environments', () => {
      expect(ENVIRONMENT_NAMES.quiet_study).toBe('Quiet Study');
      expect(ENVIRONMENT_NAMES.growing_garden).toBe('Growing Garden');
      expect(ENVIRONMENT_NAMES.scholars_courtyard).toBe("Scholar's Courtyard");
      expect(ENVIRONMENT_NAMES.living_sanctuary).toBe('Living Sanctuary');
    });
  });
});
