/**
 * HabitCalendar -- monthly calendar heatmap showing habit completions.
 *
 * Custom-built calendar grid (no external library).
 * Displays current month by default with arrows to navigate.
 * Each day: emerald fill if completed, subtle outline for today, muted for no completion.
 *
 * Accessible from HabitCard long-press menu or EditHabitSheet "History" option.
 * Implemented as a modal bottom sheet.
 */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { completionRepo } from '../../db/repos/completionRepo';
import {
  colors,
  palette,
  typography,
  fontFamilies,
  spacing,
  componentSpacing,
  radius,
} from '../../tokens';

const c = colors.dark;

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface HabitCalendarProps {
  habitId: string;
  habitName: string;
  visible: boolean;
  onClose: () => void;
  /** Current streak count to display above calendar */
  currentStreak?: number;
  /** Longest streak count to display above calendar */
  longestStreak?: number;
}

/** Get the first day of a month as a Date. */
function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1);
}

/** Get the number of days in a month. */
function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Format a month/year header string. */
function formatMonthYear(year: number, month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[month]} ${year}`;
}

/** Build a YYYY-MM-DD key for date lookup. */
function dateKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function HabitCalendar({
  habitId,
  habitName,
  visible,
  onClose,
  currentStreak = 0,
  longestStreak = 0,
}: HabitCalendarProps) {
  const now = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load completions for the visible month
  useEffect(() => {
    if (!visible) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const startDate = new Date(viewYear, viewMonth, 1).toISOString();
        const endDate = new Date(viewYear, viewMonth + 1, 1).toISOString();
        const completions = await completionRepo.getForDateRange(
          habitId,
          startDate,
          endDate,
        );

        if (cancelled) return;

        const days = new Set<string>();
        for (const comp of completions) {
          const d = new Date(comp.completedAt);
          days.add(dateKey(d.getFullYear(), d.getMonth(), d.getDate()));
        }
        setCompletedDays(days);
      } catch {
        // Silently handle -- calendar is informational
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    return () => {
      cancelled = true;
    };
  }, [visible, habitId, viewYear, viewMonth]);

  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
    // Don't go past current month
    if (viewYear === now.getFullYear() && viewMonth >= now.getMonth()) return;

    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  }, [viewMonth, viewYear, now]);

  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();

  // Build calendar grid
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfWeek = getMonthStart(viewYear, viewMonth).getDay(); // 0=Sun
  const todayKey = dateKey(now.getFullYear(), now.getMonth(), now.getDate());

  // Build rows of 7
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{habitName}</Text>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          {/* Streak stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>Current</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{longestStreak}</Text>
              <Text style={styles.statLabel}>Longest</Text>
            </View>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={handlePrevMonth} activeOpacity={0.7}>
              <Text style={styles.navArrow}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {formatMonthYear(viewYear, viewMonth)}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              activeOpacity={0.7}
              disabled={isCurrentMonth}
            >
              <Text
                style={[
                  styles.navArrow,
                  isCurrentMonth && styles.navArrowDisabled,
                ]}
              >
                {'>'}
              </Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <ActivityIndicator
              size="small"
              color={c.primary}
              style={styles.loader}
            />
          )}

          {/* Weekday header */}
          <View style={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((label, i) => (
              <Text key={i} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          {rows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.calendarRow}>
              {row.map((day, colIdx) => {
                if (day === null) {
                  return <View key={colIdx} style={styles.dayCell} />;
                }

                const key = dateKey(viewYear, viewMonth, day);
                const isCompleted = completedDays.has(key);
                const isToday = key === todayKey;
                const isFuture =
                  viewYear > now.getFullYear() ||
                  (viewYear === now.getFullYear() &&
                    viewMonth > now.getMonth()) ||
                  (viewYear === now.getFullYear() &&
                    viewMonth === now.getMonth() &&
                    day > now.getDate());

                return (
                  <View
                    key={colIdx}
                    style={[
                      styles.dayCell,
                      isCompleted && styles.dayCellCompleted,
                      isToday && !isCompleted && styles.dayCellToday,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isCompleted && styles.dayTextCompleted,
                        isFuture && styles.dayTextFuture,
                      ]}
                    >
                      {day}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: c.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: componentSpacing.modalPadding,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderColor: c.border,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: c.textMuted,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
  },
  closeButton: {
    fontSize: typography.bodyLg.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.textMuted,
    padding: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.headingLg.fontSize,
    lineHeight: typography.headingLg.lineHeight,
    fontFamily: fontFamilies.pixelFont,
    color: c.xp,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: typography.caption.fontFamily,
    color: c.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: c.border,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  navArrow: {
    fontSize: typography.headingMd.fontSize,
    fontFamily: fontFamilies.pixelFont,
    color: c.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  navArrowDisabled: {
    color: c.textMuted,
    opacity: 0.4,
  },
  monthTitle: {
    fontSize: typography.headingMd.fontSize,
    lineHeight: typography.headingMd.lineHeight,
    fontFamily: fontFamilies.pixelFont,
    color: c.textPrimary,
  },
  loader: {
    marginBottom: spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xs,
  },
  weekdayLabel: {
    width: CELL_SIZE,
    textAlign: 'center',
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontFamily: fontFamilies.interSemiBold,
    color: c.textMuted,
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  dayCell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCellCompleted: {
    backgroundColor: palette['emerald-500'],
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: c.mercy,
  },
  dayText: {
    fontSize: typography.bodySm.fontSize,
    fontFamily: typography.bodySm.fontFamily,
    color: c.textSecondary,
  },
  dayTextCompleted: {
    color: '#FFFFFF',
    fontFamily: fontFamilies.interSemiBold,
  },
  dayTextFuture: {
    color: c.textMuted,
    opacity: 0.4,
  },
});
