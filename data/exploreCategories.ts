export interface ExploreCategory {
  id: string;
  label: string;
}

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: 'all',             label: 'All' },
  { id: 'singing-dancing', label: 'Singing & Dancing' },
  { id: 'comedy',          label: 'Comedy' },
  { id: 'sports',          label: 'Sports' },
  { id: 'anime',           label: 'Anime & Comics' },
  { id: 'relationships',   label: 'Relationships' },
  { id: 'shows',           label: 'Shows' },
  { id: 'lipsync',         label: 'Lipsync' },
  { id: 'daily-life',      label: 'Daily Life' },
  { id: 'beauty',          label: 'Beauty Care' },
  { id: 'fashion',         label: 'Fashion' },
  { id: 'food',            label: 'Food' },
  { id: 'technology',      label: 'Technology' },
  { id: 'gaming',          label: 'Gaming' },
];
