"use strict";

import 'jest';
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/do";
import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

import { reassign, Store, Action, STORE_ACTIONS } from "rxstore";
import { testActions, expectedActions } from "rxstore-jest";
import {
  LoginEvents, loginReducer, LoginState, defaultLoginState,
  createLoginStore, LoginStore,
} from "./store";

const errorMessage = "some error";
const johnName = "john";
const johnSnowName = "john snow";
const passPassword = "pass";
const passwordPassword = "password";
const init = defaultLoginState();
const loginDone = reassign(init, { loginDone: true });
const errored = reassign(init, { error: errorMessage });
const loginInProgress = reassign(init, { loginInProgress: true });
const withData = reassign(init, { username: johnName, password: passwordPassword, canLogin: true });
const loginDoneWithData = reassign(withData, { loginDone: true });
const erroredWithData = reassign(withData, { error: errorMessage });
const loginInProgressWithData = reassign(withData, { loginInProgress: true });
const withDataCannotValidate = reassign(withData, { canLogin: false });
const john = reassign(init, { username: johnName });
const johnSnow = reassign(init, { username: johnSnowName });
const pass = reassign(init, { password: passPassword });
const password = reassign(init, { password: passwordPassword });

describe("defaultLoginState", () => {
  describe("Sanity checks", () => {
    it("it should be a function", () =>
      expect(typeof defaultLoginState).toEqual("function"));
  });    // Sanity checks

  describe("Given the default state", () => {
    it("it should be equal to expected state", () =>
      expect(init).toEqual({
        username: "",
        password: "",
        canLogin: false,
        loginDone: false,
        loginInProgress: false,
        error: undefined,
      }));
  });    // Given the default state
});    // defaultLoginState


testActions(LoginEvents, "LoginEvents",
  expectedActions<LoginState>("MantTest.Login/",
    actions => {
      actions.typed("usernameChanged", "USERNAME_CHANGED")
        .withSample(init, johnName, john, "intro user name")
        .withSample(john, johnSnowName, johnSnow, "update user name")
        .withSample(johnSnow, "", init, "delete user name")
        ;

      actions.typed("passwordChanged", "PASSWORD_CHANGED")
        .withSample(init, passPassword, pass, "intro password")
        .withSample(pass, passwordPassword, password, "update password")
        .withSample(password, "", init, "delete password")
        ;

      actions.empty("loginStarted", "LOGIN_STARTED")
        .withSample(init, loginInProgress, "init -> loginInProgress")
        .withSample(loginInProgress, loginInProgress, "loginInProgress -> loginInProgress")
        .withSample(errored, loginInProgress, "errored -> loginInProgress")
        .withSample(withData, loginInProgressWithData, "withData -> loginInProgressWithData")
        .withSample(loginInProgressWithData, loginInProgressWithData, "loginInProgressWithData -> loginInProgressWithData")
        .withSample(erroredWithData, loginInProgressWithData, "erroredWithData -> loginInProgressWithData")
        ;

      actions.empty("loginCompleted", "LOGIN_COMPLETED")
        .withSample(init, loginDone, "init -> loginDone")
        .withSample(loginInProgress, loginDone, "loginInProgress -> loginDone")
        .withSample(errored, loginDone, "errored -> loginDone")
        .withSample(withData, loginDoneWithData, "withData -> loginDoneWithData")
        .withSample(loginInProgressWithData, loginDoneWithData, "loginInProgressWithData -> loginDoneWithData")
        .withSample(erroredWithData, loginDoneWithData, "erroredWithData -> loginDoneWithData")
        ;

      actions.typed("loginFailed", "LOGIN_FAILED")
        .withSample(init, errorMessage, errored, "init -> errored")
        .withSample(loginInProgress, errorMessage, errored, "loginInProgress -> errored")
        .withSample(errored, errorMessage, errored, "errored -> errored")
        .withSample(withData, errorMessage, erroredWithData, "withData -> erroredWithData")
        .withSample(loginInProgressWithData, errorMessage, erroredWithData, "loginInProgressWithData -> erroredWithData")
        .withSample(erroredWithData, errorMessage, erroredWithData, "erroredWithData -> erroredWithData")
        ;

      actions.typed("canLoginChanged", "CAN_LOGIN_CHANGED")
        .withSample(withData, false, withDataCannotValidate)
        .withSample(withData, true, withData)
        .withSample(withDataCannotValidate, false, withDataCannotValidate)
        .withSample(withDataCannotValidate, true, withData)
        ;

      actions.empty("login", "LOGIN");
    }),
);

const testStoreLastStateEffects =
  <TState, TStore extends Store<TState>>(
    givenDescription: string,
    createStore: () => TStore) => (
      whenDescription: string,
      expectationsDescription: string,
      events: Action[] | Observable<Action>,
      expectations: (state: TState) => any,
    ) => {
      describe(givenDescription, () => {
        describe(whenDescription, () => {
          it(expectationsDescription, () => {
            const store = createStore();
            const actions = Array.isArray(events) ? Observable.of(...events) : events;
            const prom = actions
              .concat(Observable.of<Action>({ type: STORE_ACTIONS.FINISH }))
              .do(store.dispatch)
              .switchMap(() => Observable.empty<TState>())
              .concat(store.state$)
              .last().timeout(40)
              .toPromise() as PromiseLike<TState>;
            return prom.then(expectations);
          });
        });    // Given a store 
      });    // Given a store 
    };

describe("createLoginStore", () => {
  const serviceEmptyMock = () => null;

  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof createLoginStore).toBe("function"));
  }); //    Sanity checks

  testStoreLastStateEffects<LoginState, LoginStore>(
    "Given no initial state",
    createLoginStore(serviceEmptyMock)
  )(
    "When the store receives no events",
    "the first state should be the default state",
    [],
    state => expect(state).toEqual(defaultLoginState())
    );

  testStoreLastStateEffects<LoginState, LoginStore>(
    "Given an initial state",
    () => createLoginStore(serviceEmptyMock)({ init: withData })
  )(
    "When the store receives no events",
    "the first state should be the given state",
    [],
    state => expect(state).toEqual(withData)
    );

  describe("Typing username and password", () => {
    const lastStateTester =
      testStoreLastStateEffects<LoginState, LoginStore>(
        "Given a Login store",
        createLoginStore(serviceEmptyMock)
      );

    lastStateTester(
      "When the store receives no events",
      "it should not be possible to login (canLogin === false)",
      [],
      state => expect(state.canLogin).toBeFalsy()
    );

    lastStateTester(
      "When the username is introduced",
      "it should not be possible to login (canLogin === false)",
      [LoginEvents.usernameChanged.create(johnName)],
      state => expect(state.canLogin).toBeFalsy()
    );

    lastStateTester(
      "When the password is introduced",
      "it should not be possible to login (canLogin === false)",
      [LoginEvents.passwordChanged.create(passPassword)],
      state => expect(state.canLogin).toBeFalsy()
    );

    lastStateTester(
      "When the username and password are introduced",
      "it should be possible to login (canLogin === true)",
      [
        LoginEvents.usernameChanged.create(johnName),
        LoginEvents.passwordChanged.create(passPassword),
      ],
      state => expect(state.canLogin).toBeTruthy()
    );

    lastStateTester(
      "When the username and password are introduced and then the username is deleted",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.usernameChanged.create(johnName),
        LoginEvents.passwordChanged.create(passPassword),
        LoginEvents.usernameChanged.create(""),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );

    lastStateTester(
      "When the username and password are introduced and then the password is deleted",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.usernameChanged.create(johnName),
        LoginEvents.passwordChanged.create(passPassword),
        LoginEvents.passwordChanged.create(""),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );
  });    // Typing username and password
}); //    createLoginStore
