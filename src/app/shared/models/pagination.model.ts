export type Pagination<T> = {
  page: number
  size: number
  data: T[]
  total: number
}
