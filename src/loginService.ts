import { Observable } from "rxjs/Observable";

export interface ErrorLoginResult {
  kind: "error";
  error: string;
}

export interface SuccessLoginResult {
  kind: "success";
}

export type LoginResult = ErrorLoginResult | SuccessLoginResult;

export type LoginService =
  (username: string, password: string) => Observable<LoginResult>;
