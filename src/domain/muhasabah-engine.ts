/**
 * Muhasabah engine — pure TypeScript, no React imports.
 *
 * Handles:
 *   - isMuhasabahTime: Determines if it's time for evening reflection
 *   - CLOSING_CONTENT: Curated, vetted Quranic ayat and hadith for closing screen
 *   - getClosingContent: Rotates through curated content by index
 *
 * Privacy note: Muhasabah data is classified PRIVATE in the Privacy Gate.
 * This module contains no DB access — data layer lives in muhasabahRepo.
 */

import type { PrayerWindow } from '../types/habits';

// ─── Muhasabah Trigger ────────────────────────────────────────────────────────

/**
 * Check if current time is within or after Isha window (Muhasabah available).
 *
 * If no ishaWindow is provided (location not set), falls back to 21:00 local time.
 *
 * @param ishaWindow - The Isha prayer window from prayer-times service, or null
 * @param now - Current time (defaults to new Date())
 */
export function isMuhasabahTime(
  ishaWindow: Pick<PrayerWindow, 'start'> | null,
  now = new Date(),
): boolean {
  if (!ishaWindow) {
    // Fallback: 9 PM local time when location is not available
    return now.getHours() >= 21;
  }
  return now >= ishaWindow.start;
}

// ─── Closing Content ──────────────────────────────────────────────────────────

export interface ClosingContent {
  id: string;
  type: 'ayah' | 'hadith';
  arabic: string;
  translation: string;
  source: string;
}

/**
 * Curated closing content for the Muhasabah closing screen.
 * All entries vetted for accuracy and appropriate context.
 * Content is encouraging and effort-affirming — no shame, no judgment.
 */
export const CLOSING_CONTENT: readonly ClosingContent[] = [
  {
    id: 'quran_2_286',
    type: 'ayah',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    translation: 'Allah does not burden a soul beyond that it can bear.',
    source: 'Quran 2:286',
  },
  {
    id: 'quran_3_200',
    type: 'ayah',
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا',
    translation: 'O you who have believed, persevere and endure and remain stationed.',
    source: 'Quran 3:200',
  },
  {
    id: 'hadith_bukhari_consistency',
    type: 'hadith',
    arabic: 'أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ',
    translation:
      'The most beloved deeds to Allah are those done consistently, even if they are small.',
    source: 'Bukhari 6464',
  },
  {
    id: 'quran_94_5_6',
    type: 'ayah',
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    translation: 'For indeed, with hardship will be ease. Indeed, with hardship will be ease.',
    source: 'Quran 94:5-6',
  },
  {
    id: 'hadith_muslim_ability',
    type: 'hadith',
    arabic: 'تَكَلَّفُوا مِنَ الأَعْمَالِ مَا تُطِيقُونَ',
    translation:
      'Take up good deeds only as much as you are able, for the best deeds are those done consistently.',
    source: 'Muslim 782',
  },
  {
    id: 'quran_39_53',
    type: 'ayah',
    arabic: 'لَا تَقْنَطُوا مِنْ رَحْمَةِ اللَّهِ',
    translation: 'Do not despair of the mercy of Allah.',
    source: 'Quran 39:53',
  },
  {
    id: 'hadith_tirmidhi_dhikr',
    type: 'hadith',
    arabic: 'أَلاَ بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    source: 'Quran 13:28',
  },
] as const;

/**
 * Get a closing content item by rotating index.
 * Wraps around if index exceeds array length.
 *
 * @param index - Any non-negative integer (modulo applied)
 */
export function getClosingContent(index: number): ClosingContent {
  return CLOSING_CONTENT[index % CLOSING_CONTENT.length] as ClosingContent;
}
