"use strict";

import "jest";
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import { queue } from "rxjs/scheduler/queue";
import "rxjs/add/observable/concat";
import "rxjs/add/observable/empty";
import "rxjs/add/observable/of";
import "rxjs/add/operator/catch";
import "rxjs/add/operator/concat";
import "rxjs/add/operator/delay";
import "rxjs/add/operator/do";
import "rxjs/add/operator/first";
import "rxjs/add/operator/filter";
import "rxjs/add/operator/last";
import "rxjs/add/operator/map";
import "rxjs/add/operator/observeOn";
import "rxjs/add/operator/subscribeOn";
import "rxjs/add/operator/switchMap";
import "rxjs/add/operator/takeLast";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

import * as deepEqual from "deep-equal";

import {
  reassign, Store, Action, StoreActions, logUpdates, startEffects,
  tunnelActions, ActionTunnel,
} from "rxstore";
import { testActions, expectedActions } from "rxstore-jest";
import {
  LoginEvents, loginReducer, LoginState, defaultLoginState,
  createLoginStore, LoginStore,
  LoginService, ErrorLoginResult, SuccessLoginResult, LoginResult,
} from "./index";
import {
  testUpdateEffects, testActionEffects, testStateEffects,
  expectAction, expectItem, testLastStateEffects,
} from "rxstore-jest";

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
      expect(defaultLoginState()).toEqual({
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
        .withSample(loginInProgressWithData, loginInProgressWithData,
        "loginInProgressWithData -> loginInProgressWithData")
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
        .withSample(loginInProgressWithData, errorMessage, erroredWithData,
        "loginInProgressWithData -> erroredWithData")
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

describe("createLoginStore", () => {
  const serviceEmptyMock = jest.fn(() => null);
  const serviceSuccessMock =
    (delay: number = 40) =>
      jest.fn<Observable<LoginResult>>(() =>
        Observable
          .of<LoginResult>({ kind: "success" })
          // .do<LoginResult>(u => console.log("Generating login result: ", u))
          .delay(delay, queue));
  const serviceErrorMock =
    (delay: number = 40) =>
      jest.fn<Observable<LoginResult>>(() =>
        Observable
          .of<LoginResult>({ kind: "error", error: errorMessage })
          .delay(delay, queue));

  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof createLoginStore).toBe("function"));
  }); //    Sanity checks

  describe("Initial state testing", () => {
    testLastStateEffects<LoginState, LoginStore>("Given no initial state",
      createLoginStore(serviceEmptyMock)
    )("When the store receives no events",
      "the first state should be the default state",
      [],
      state => expect(state).toEqual(init),
      { count: 1 });

    testLastStateEffects<LoginState, LoginStore>("Given an initial state",
      () => createLoginStore(serviceEmptyMock)({ init: withData })
    )("When the store receives no events",
      "the first state should be the given state",
      [],
      state => expect(state).toEqual(withData),
      { count: 1 });
  });    // Initial state testing

  describe("Validation effects", () => {
    const validationStateTest = testLastStateEffects<LoginState, LoginStore>(
      "Given a Login store",
      createLoginStore(serviceEmptyMock)
    );

    validationStateTest(
      "When the store receives no events",
      "it should not be possible to login (canLogin === false)",
      [],
      state => expect(state.canLogin).toBeFalsy(),
      { count: 1, timeout: 200 }
    );

    validationStateTest(
      "When the username is introduced",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.usernameChanged(johnName),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );

    validationStateTest(
      "When the password is introduced",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.passwordChanged(passPassword),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );

    validationStateTest(
      "When the username and password are introduced",
      "it should be possible to login (canLogin === true)",
      [
        LoginEvents.usernameChanged(johnName),
        LoginEvents.passwordChanged(passPassword),
      ],
      state => expect(state.canLogin).toBeTruthy()
    );

    validationStateTest(
      "When the username and password are introduced and then the username is deleted",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.usernameChanged(johnName),
        LoginEvents.passwordChanged(passPassword),
        LoginEvents.usernameChanged(""),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );

    validationStateTest(
      "When the username and password are introduced and then the password is deleted",
      "it should not be possible to login (canLogin === false)",
      [
        LoginEvents.usernameChanged(johnName),
        LoginEvents.passwordChanged(passPassword),
        LoginEvents.passwordChanged(""),
      ],
      state => expect(state.canLogin).toBeFalsy()
    );
  });    // Typing username and password

  describe("Login service effects", () => {
    const successTester =
      testActionEffects<LoginState, LoginStore>(
        "Given a Login store with success results",
        () => createLoginStore(serviceSuccessMock(0))({
          middlewaresAfter: [
            // logUpdates({ logger: console.log.bind(console) }),
          ],
        })
      );
    const errorTester =
      testActionEffects<LoginState, LoginStore>(
        "Given a Login store with error results",
        () => createLoginStore(serviceErrorMock(0))()
      );

    successTester("When the store receives a login command under successful conditions",
      "it should produces a loginStarted and a loginCompleted events",
      store => Observable.concat(
        Observable.of(LoginEvents.usernameChanged(johnName)).delay(10),
        Observable.of(LoginEvents.passwordChanged(passPassword)).delay(10),
        store.state$.first(s => s.canLogin).map(a => LoginEvents.login()).delay(10),
      ),
      actions => {
        expectAction(actions, LoginEvents.loginStarted());
        expectAction(actions, LoginEvents.loginCompleted());
      }, {
        timeout: 200,
        count: 2,
      }
    );

    errorTester("When the store receives a login command under failure conditions",
      "it should produces a loginStarted and a loginFailed events",
      store => Observable.concat(
        Observable.of(LoginEvents.usernameChanged(johnName)).delay(10),
        Observable.of(LoginEvents.passwordChanged(passPassword)).delay(10),
        store.state$.first(s => s.canLogin).map(a => LoginEvents.login()).delay(10),
      ),
      actions => {
        expectAction(actions, LoginEvents.loginStarted());
        expectAction(actions, LoginEvents.loginFailed(errorMessage));
      }, {
        timeout: 200,
        count: 2,
      }
    );
  });    // Login service effects
}); //    createLoginStore
