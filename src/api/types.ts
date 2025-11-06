export interface ResultVO<T = any> {
  code: number;
  msg?: string;
  message?: string;
  data: T;
}
