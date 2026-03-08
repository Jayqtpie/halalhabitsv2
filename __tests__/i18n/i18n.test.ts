import i18n from '../../src/i18n/config';

describe('i18n Infrastructure', () => {
  it('initializes without errors', () => {
    expect(i18n.isInitialized).toBe(true);
  });

  it('uses English as default language', () => {
    expect(i18n.language).toBe('en');
  });

  it('resolves app.name translation', () => {
    expect(i18n.t('app.name')).toBe('HalalHabits');
  });

  it('resolves app.tagline with mentor voice', () => {
    expect(i18n.t('app.tagline')).toBe('Your discipline grows stronger');
  });

  it('resolves tab name translations', () => {
    expect(i18n.t('tabs.home')).toBe('Home');
    expect(i18n.t('tabs.habits')).toBe('Habits');
    expect(i18n.t('tabs.quests')).toBe('Quests');
    expect(i18n.t('tabs.profile')).toBe('Profile');
  });

  it('resolves common string translations', () => {
    expect(i18n.t('common.loading')).toBe('Loading...');
    expect(i18n.t('common.error')).toBe('Something went wrong');
    expect(i18n.t('common.retry')).toBe('Try Again');
    expect(i18n.t('common.cancel')).toBe('Cancel');
    expect(i18n.t('common.save')).toBe('Save');
    expect(i18n.t('common.delete')).toBe('Delete');
  });

  it('returns key for missing translations', () => {
    expect(i18n.t('nonexistent.key')).toBe('nonexistent.key');
  });

  it('supports interpolation', () => {
    expect(i18n.t('placeholder.phaseIndicator', { phase: 2 })).toBe('Phase 2');
  });

  it('has compatibilityJSON set to v4', () => {
    expect(i18n.options.compatibilityJSON).toBe('v4');
  });
});
