import { DEMO_DATA_RECORDS, type DemoGameRecord } from './demo-data';

export const DEMO_POPULARITY_THRESHOLD = 1000;

const GENRES = ['RPG', 'Course', 'Simulation'] as const;

export interface DemoResultRow {
  record: DemoGameRecord;
  /** Index dans la liste des options de genre du dictionnaire. */
  genreIndex: number;
  popular: boolean;
}

export function getDemoResult(record: DemoGameRecord): DemoResultRow {
  const found = GENRES.indexOf(record.categorie as (typeof GENRES)[number]);
  return {
    record,
    genreIndex: found === -1 ? 0 : found,
    popular: record.total_reviews > DEMO_POPULARITY_THRESHOLD,
  };
}

export const DEMO_RESULT_ROWS: readonly DemoResultRow[] = DEMO_DATA_RECORDS.map(getDemoResult);
