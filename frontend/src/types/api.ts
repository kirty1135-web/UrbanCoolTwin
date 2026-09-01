export interface ApiMeta {
  location?: string;
  timestamp?: string;
  source?: string;
  observed_at?: string;
  quality?: string;
  generated_at?: string;
  model_version?: string;
}

export interface ApiListMeta extends ApiMeta {
  count: number;
  page: number;
  page_size: number;
  from?: string;
  to?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: ApiListMeta;
}
