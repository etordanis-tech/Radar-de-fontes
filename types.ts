
export interface SearchResource {
  title: string;
  url: string;
  description: string;
  category: 'legal' | 'alternative';
}

export interface SearchResult {
  summary: string;
  resources: SearchResource[];
  groundingUrls: string[];
}
