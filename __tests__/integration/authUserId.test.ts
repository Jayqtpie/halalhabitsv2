/**
 * Integration tests -- verify userId propagation and AccountNudgeBanner wiring.
 *
 * These are static analysis tests that read source files to verify
 * no hardcoded 'default-user' constants remain in tab screens.
 *
 * This approach avoids needing to mock the entire React Native rendering
 * pipeline while still providing regression protection for the wiring.
 */
import * as fs from 'fs';
import * as path from 'path';

const TAB_DIR = path.resolve(__dirname, '../../app/(tabs)');

const readTab = (filename: string) =>
  fs.readFileSync(path.join(TAB_DIR, filename), 'utf-8');

describe('userId propagation -- no hardcoded default-user', () => {
  const tabFiles = ['index.tsx', 'habits.tsx', 'quests.tsx', 'profile.tsx'];

  tabFiles.forEach((file) => {
    it(`${file} does not assign a hardcoded 'default-user' constant`, () => {
      const content = readTab(file);
      // Match patterns like: const USER_ID = 'default-user' or const DEFAULT_USER_ID = 'default-user'
      expect(content).not.toMatch(/const\s+\w*USER_ID\s*=\s*['"]default-user['"]/);
    });

    it(`${file} imports useAuthStore`, () => {
      const content = readTab(file);
      expect(content).toMatch(/import\s+\{[^}]*useAuthStore[^}]*\}\s+from/);
    });
  });
});

describe('AccountNudgeBanner wiring in index.tsx', () => {
  it('imports AccountNudgeBanner component', () => {
    const content = readTab('index.tsx');
    expect(content).toMatch(/import\s+\{[^}]*AccountNudgeBanner[^}]*\}/);
  });

  it('imports TITLE_SEED_DATA for title name resolution', () => {
    const content = readTab('index.tsx');
    expect(content).toMatch(/import\s+\{[^}]*TITLE_SEED_DATA[^}]*\}/);
  });

  it('renders AccountNudgeBanner in JSX', () => {
    const content = readTab('index.tsx');
    expect(content).toMatch(/<AccountNudgeBanner/);
  });

  it('uses titleRepo.getUserTitles for trigger condition', () => {
    const content = readTab('index.tsx');
    expect(content).toMatch(/titleRepo\.getUserTitles/);
  });
});

describe('your-data.tsx userId propagation', () => {
  const YOUR_DATA_PATH = path.resolve(__dirname, '../../app/your-data.tsx');
  const yourDataContent = fs.readFileSync(YOUR_DATA_PATH, 'utf-8');

  it('does not assign a hardcoded default-user constant', () => {
    expect(yourDataContent).not.toMatch(/const\s+\w*USER_ID\s*=\s*['"]default-user['"]/);
  });

  it('imports useAuthStore', () => {
    expect(yourDataContent).toMatch(/import\s+\{[^}]*useAuthStore[^}]*\}\s+from/);
  });
});
