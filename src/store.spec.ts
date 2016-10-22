"use strict";

import 'jest';
require("babel-core/register");
require("babel-polyfill");
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/first";
import "rxjs/add/operator/timeout";
import "rxjs/add/operator/toPromise";

import { reassign } from "rxstore";
import { testActions, expectedActions } from "rxstore-jest";
import {
  LoginEvents, loginReducer, LoginState, defaultLoginState,
  createLoginStore,
} from "./store";

const errorMessage = "some error";
const johnName = "john";
const johnSnowName = "john snow";
const passPassword = "pass";
const passwordPassword = "password";
const init = defaultLoginState();
const validated = reassign(init, { validated: true });
const errored = reassign(init, { error: errorMessage });
const validating = reassign(init, { validating: true });
const withData = reassign(init, { username: johnName, password: passwordPassword, canValidate: true });
const validatedWithData = reassign(withData, { validated: true });
const erroredWithData = reassign(withData, { error: errorMessage });
const validatingWithData = reassign(withData, { validating: true });
const withDataCannotValidate = reassign(withData, { canValidate: false });
const john = reassign(init, { username: johnName });
const johnSnow = reassign(init, { username: johnSnowName });
const pass = reassign(init, { password: passPassword });
const password = reassign(init, { password: passwordPassword });

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

      actions.empty("validationStarted", "VALIDATION_STARTED")
        .withSample(init, validating, "init -> validating")
        .withSample(validating, validating, "validating -> validating")
        .withSample(errored, validating, "errored -> validating")
        .withSample(withData, validatingWithData, "withData -> validatingWithData")
        .withSample(validatingWithData, validatingWithData, "validatingWithData -> validatingWithData")
        .withSample(erroredWithData, validatingWithData, "erroredWithData -> validatingWithData")
        ;

      actions.empty("validationCompleted", "VALIDATION_COMPLETED")
        .withSample(init, validated, "init -> validated")
        .withSample(validating, validated, "validating -> validated")
        .withSample(errored, validated, "errored -> validated")
        .withSample(withData, validatedWithData, "withData -> validatedWithData")
        .withSample(validatingWithData, validatedWithData, "validatingWithData -> validatedWithData")
        .withSample(erroredWithData, validatedWithData, "erroredWithData -> validatedWithData")
        ;

      actions.typed("validationFailed", "VALIDATION_FAILED")
        .withSample(init, errorMessage, errored, "init -> errored")
        .withSample(validating, errorMessage, errored, "validating -> errored")
        .withSample(errored, errorMessage, errored, "errored -> errored")
        .withSample(withData, errorMessage, erroredWithData, "withData -> erroredWithData")
        .withSample(validatingWithData, errorMessage, erroredWithData, "validatingWithData -> erroredWithData")
        .withSample(erroredWithData, errorMessage, erroredWithData, "erroredWithData -> erroredWithData")
        ;

      actions.typed("canValidateChanged", "CAN_VALIDATE_CHANGED")
        .withSample(withData, false, withDataCannotValidate)
        .withSample(withData, true, withData)
        .withSample(withDataCannotValidate, false, withDataCannotValidate)
        .withSample(withDataCannotValidate, true, withData)
        ;

      actions.empty("validate", "VALIDATE");
    }),
);

describe("createLoginStore", () => {
  describe("Sanity checks", () => {
    it("it should be a function",
      () => expect(typeof createLoginStore).toBe("function"));
  }); //    Sanity checks

  describe("Given no initial state", () => {
    describe("When a store is created", () => {
      const store = createLoginStore();
      it("the first state should be the default state",
        () => {
          const prom = store.state$
            .first().timeout(40)
            .toPromise() as PromiseLike<LoginState>;
          return prom.then(s => expect(s).toEqual(defaultLoginState()));
        });
    }); //    When a store is created
  }); //    Given no initial state the first state should be the default state

  describe("Given an initial state", () => {
    describe("When a store is created", () => {
      const store = createLoginStore(withData);
      it("the first state should be the given state",
        () => {
          const prom = store.state$
            .first().timeout(40)
            .toPromise() as PromiseLike<LoginState>;
          return prom.then(s => expect(s).toEqual(init));
        });
    }); //    When a store is created
  }); //    Given no initial state the first state should be the default state
}); //    createLoginStore
