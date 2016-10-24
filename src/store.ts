import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/of";
import "rxjs/add/observable/merge";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/startWith";
import "rxjs/add/operator/observeOn";
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/debounceTime";
import "rxjs/add/operator/timeout";
import * as deepEqual from "deep-equal";
import {
  reassign, reassignif,
  actionCreator, TypedActionDescription, EmptyActionDescription,
  reducerFromActions, Reducer, StateUpdate,
  createStore, Store, StoreMiddleware,
  withEffects, defineStore, ICreateStoreOptions, logUpdates,
  tunnelActions, extendWithActions, extendWith,
} from "rxstore";
import { LoginService, LoginResult } from "./loginService";

/* MODELS */

export interface LoginState {
  username: string;
  password: string;
  loginInProgress: boolean;
  canLogin: boolean;
  loginDone: boolean;
  error: string | undefined;
}

/* ACTIONS */

export interface ILoginEvents {
  usernameChanged(value: string): void;
  passwordChanged(value: string): void;
  loginStarted(): void;
  loginCompleted(): void;
  loginFailed(error: string): void;
  canLoginChanged(value: string): void;
  login(): void;
}

const newEvent = actionCreator<LoginState>("MantTest.Login/");

export const LoginEvents = {
  usernameChanged: newEvent.of<string>(
    "USERNAME_CHANGED",
    (s, username) => reassign(s, { username })),

  passwordChanged: newEvent.of<string>(
    "PASSWORD_CHANGED",
    (s, password) => reassign(s, { password })),

  loginStarted: newEvent(
    "LOGIN_STARTED",
    s => reassign(s, { loginInProgress: true, error: undefined })),

  loginCompleted: newEvent(
    "LOGIN_COMPLETED",
    s => reassign(s, { loginInProgress: false, loginDone: true, error: undefined })),

  loginFailed: newEvent.of<string>(
    "LOGIN_FAILED",
    (s, error) => reassign(s, { loginInProgress: false, loginDone: false, error })),

  canLoginChanged: newEvent.of<boolean>(
    "CAN_LOGIN_CHANGED",
    (s, canLogin) => reassign(s, { canLogin })),

  login: newEvent("LOGIN"),
};

/* STORE */

export const loginReducer = reducerFromActions(LoginEvents);

export type LoginStore = Store<LoginState> & ILoginEvents;

export const defaultLoginState = (): LoginState => ({
  username: "",
  password: "",
  canLogin: false,
  loginDone: false,
  loginInProgress: false,
  error: undefined,
});

const validationEffects = (store: LoginStore) =>
  store.state$
    .map(s => !!s.username && !!s.password)
    .distinctUntilChanged()
    .map(LoginEvents.canLoginChanged);

const loginEffects =
  (loginService: LoginService) =>
    (store: LoginStore) =>
      store.update$
        .filter(u => u.action.type === LoginEvents.login.type)
        .filter(u => u.state.canLogin)
        // .do<StateUpdate<LoginState>>(u => console.log("Login Effect: ", u))
        .switchMap(u =>
          loginService(u.state.username, u.state.password)
            // .do<LoginResult>(r => console.log("Login Result: ", r))
            .map(r => r.kind === "success"
              ? LoginEvents.loginCompleted()
              : LoginEvents.loginFailed(r.error))
            .timeout(10000, Observable.of(LoginEvents.loginFailed("Service is unavailable right now")))
            .startWith(LoginEvents.loginStarted.create())
        );

export const createLoginStore =
  (loginService: LoginService) =>
    defineStore<LoginState, LoginStore>(
      loginReducer,
      defaultLoginState,
      withEffects(
        validationEffects,
        loginEffects(loginService)),
      extendWithActions(LoginEvents)
    );
