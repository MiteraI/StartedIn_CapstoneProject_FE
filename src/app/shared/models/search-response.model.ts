export type SearchResponseModel<T> = {
  responseList: T[];
  pageIndex: number;
  pageSize: number;
  totalRecord: number;
  totalPage: number;
}
