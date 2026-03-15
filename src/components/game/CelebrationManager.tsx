/**
 * CelebrationManager -- Queue-based overlay manager consuming pendingCelebrations.
 *
 * Reads pendingCelebrations from gameStore. Renders one celebration at a time.
 * On dismiss (Continue/Equip/Later), calls consumeCelebration() to dequeue.
 * If Equip is pressed, also calls equipTitle() before consuming.
 *
 * Renders null when celebration queue is empty.
 */
import React, { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '../../stores/gameStore';
import { LevelUpOverlay } from './LevelUpOverlay';
import { TitleUnlockOverlay } from './TitleUnlockOverlay';

const DEFAULT_USER_ID = 'default-user';

export function CelebrationManager() {
  const { pendingCelebrations, consumeCelebration, equipTitle } = useGameStore(
    useShallow((s) => ({
      pendingCelebrations: s.pendingCelebrations,
      consumeCelebration: s.consumeCelebration,
      equipTitle: s.equipTitle,
    })),
  );

  const current = pendingCelebrations[0] ?? null;

  const handleContinue = useCallback(() => {
    consumeCelebration();
  }, [consumeCelebration]);

  const handleEquip = useCallback(async (titleId: string) => {
    await equipTitle(DEFAULT_USER_ID, titleId);
    consumeCelebration();
  }, [equipTitle, consumeCelebration]);

  const handleLater = useCallback(() => {
    consumeCelebration();
  }, [consumeCelebration]);

  if (!current) return null;

  if (current.type === 'level_up') {
    return (
      <LevelUpOverlay
        level={current.level}
        copy={current.copy}
        unlockedTitles={current.unlockedTitles}
        onContinue={handleContinue}
      />
    );
  }

  if (current.type === 'title_unlock') {
    return (
      <TitleUnlockOverlay
        title={current.title}
        onEquip={() => handleEquip(current.titleId)}
        onLater={handleLater}
      />
    );
  }

  return null;
}
