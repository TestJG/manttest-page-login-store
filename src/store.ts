import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/distinctUntilChanged";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import {
  reassign, reassignif,
  actionCreator, TypedActionDescription, EmptyActionDescription,
  reducerFromActions, Reducer,
  createStore, Store, StoreMiddleware,
  withEffects, EffectsFactory,
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

/* REDUCER */

export const loginReducer = reducerFromActions(LoginEvents);

/* EXTRACT to rxstore */

export interface ICreateStoreOptions<TState> {
  init?: TState;
  middlewaresBefore?: StoreMiddleware<Store<TState>>[];
  middlewaresAfter?: StoreMiddleware<Store<TState>>[];
}

interface IInternalCreateStoreOptions<TState> {
  init: TState;
  middlewaresBefore: StoreMiddleware<Store<TState>>[];
  middlewaresAfter: StoreMiddleware<Store<TState>>[];
}

const createDefaultOptions = <TState>(
  defaultState: TState | (() => TState)
): IInternalCreateStoreOptions<TState> => ({
  init: typeof defaultState === "function" ? defaultState() : defaultState,
  middlewaresBefore: [],
  middlewaresAfter: [],
});

const getOptions = <TState>(
  defaultState: TState | (() => TState),
  options?: ICreateStoreOptions<TState>
): IInternalCreateStoreOptions<TState> => {
  const defaultOptions = createDefaultOptions(defaultState);
  const result = reassign(defaultOptions, options);
  return result!;
};

export const createStoreHelper =
  <TState, TStore extends Store<TState>>(
    reducer: Reducer<TState>,
    defaultState: TState | (() => TState),
    ...middlewares: StoreMiddleware<Store<TState>>[]
  ) =>
    (options?: ICreateStoreOptions<TState>) => {
      const opts = getOptions(defaultState, options);
      const store = createStore<TState, TStore>(
        reducer,
        opts.init,
        ...opts.middlewaresBefore,
        ...middlewares,
        ...opts.middlewaresAfter,
      );
      return store;
    };

/* STORE */

export type LoginStore = Store<LoginState> & ILoginEvents;

export const defaultLoginState = (): LoginState => ({
  username: "",
  password: "",
  canLogin: false,
  loginDone: false,
  loginInProgress: false,
  error: undefined,
});

export const validationEffects = (store: LoginStore) => {
  store.state$
    .map(s => !!s.username && !!s.password)
    .distinctUntilChanged()
    .map(LoginEvents.canLoginChanged.create)
    .subscribe(store.dispatch);
};

export const loginEffects =
  (loginService: LoginService) =>
    (store: LoginStore) => {
      return;
    };

export const createLoginStore =
  (loginService: LoginService) => {
    return createStoreHelper<LoginState, LoginStore>(
      loginReducer,
      defaultLoginState,
      withEffects(validationEffects),
      withEffects(loginEffects(loginService)),
    );
  };
