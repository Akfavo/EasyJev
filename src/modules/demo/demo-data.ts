export interface DemoGameRecord {
  game: string;
  publisher: string;
  total_reviews: number;
  categorie: string;
}

export const DEMO_DATA_RECORDS: readonly DemoGameRecord[] = [
  {
    game: 'Chronicles of Aethelgard',
    publisher: 'MoonForge Studios',
    total_reviews: 1420,
    categorie: 'RPG',
  },
  {
    game: 'Pixel Drift 2088',
    publisher: 'NeonByte Games',
    total_reviews: 850,
    categorie: 'Course',
  },
  {
    game: 'Starlight Botanist',
    publisher: 'CozySprout Interactive',
    total_reviews: 3200,
    categorie: 'Simulation',
  },
] as const;

export const DEMO_DATA_JSON = JSON.stringify(DEMO_DATA_RECORDS, null, 2);

export const DEMO_PROMPTS = {
  fr: 'Catégorise le genre du jeu et dis si le succès est confirmé avec plus de 1000 avis.',
  en: 'Categorize the game genre and tell whether success is confirmed with over 1000 reviews.',
} as const;
