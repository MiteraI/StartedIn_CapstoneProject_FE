export type SearchResponseModel<T> = {
  data: T[];
  page: number;
  size: number;
  total: number;
}
