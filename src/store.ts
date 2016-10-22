import {
  reassign, reassignif,
  actionCreator, TypedActionInstance, EmptyActionInstance,
  reducerFromActions, Reducer,
  createStore, Store, StoreMiddleware,
} from "rxstore";

/* MODELS */

export interface LoginState {
  username: string;
  password: string;
  validating: boolean;
  canValidate: boolean;
  validated: boolean;
  error: string | undefined;
}

/* ACTIONS */

export interface ILoginEvents {
  usernameChanged(value: string): void;
  passwordChanged(value: string): void;
  validationStarted(): void;
  validationCompleted(): void;
  validationFailed(error: string): void;
  canValidateChanged(value: string): void;
  validate(): void;
}

const newEvent = actionCreator<LoginState>("MantTest.Login/");

export const LoginEvents = {
  usernameChanged: newEvent.of<string>(
    "USERNAME_CHANGED",
    (s, username) => reassign(s, { username })),

  passwordChanged: newEvent.of<string>(
    "PASSWORD_CHANGED",
    (s, password) => reassign(s, { password })),

  validationStarted: newEvent(
    "VALIDATION_STARTED",
    s => reassign(s, { validating: true, error: undefined })),

  validationCompleted: newEvent(
    "VALIDATION_COMPLETED",
    s => reassign(s, { validating: false, validated: true, error: undefined })),

  validationFailed: newEvent.of<string>(
    "VALIDATION_FAILED",
    (s, error) => reassign(s, { validating: false, validated: false, error })),

  canValidateChanged: newEvent.of<boolean>(
    "CAN_VALIDATE_CHANGED",
    (s, canValidate) => reassign(s, { canValidate })),

  validate: newEvent("VALIDATE"),
};

/* REDUCER */

export const defaultLoginState = (): LoginState => ({
  username: "",
  password: "",
  canValidate: false,
  validated: false,
  validating: false,
  error: undefined,
});

export const loginReducer = reducerFromActions(LoginEvents);

/* STORE */

export type LoginStore = Store<LoginState> & ILoginEvents;

export interface ICreateStoreOptions<TState> {
  init?: TState;
  middlewaresBefore?: StoreMiddleware<LoginStore>[];
  middlewaresAfter?: StoreMiddleware<LoginStore>[];
}

const defaultOptions = {
  middlewaresBefore: [],
  middlewaresAfter: [],
};

export const createStoreHelper =
  <TState, TStore extends Store<TState>>(
    reducer: Reducer<TState>,
    defaultState: TState | (() => TState),
    ...middlewares: StoreMiddleware<LoginStore>[]
  ) =>
  (options?: ICreateStoreOptions<LoginState>) => {
    const opts = reassign(defaultOptions, {
      init: typeof defaultState === "function" ? defaultState() : defaultState,
    }, options);
    return createStore(reducer, opts.init);
  };


export const createLoginStore = createStoreHelper(loginReducer, defaultLoginState);
