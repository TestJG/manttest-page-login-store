import {
  actionCreator, reassign, reassignif, reducerFromActions, Reducer,
  TypedActionInstance, EmptyActionInstance,
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

const newAction = actionCreator<LoginState>("MantTest--Login--Event--");
const command = actionCreator<LoginState>("MantTest--Login--Command--");

export const LoginEvents = {
  usernameChanged: newAction.of<string>("USERNAME_CHANGED",
    (s, username) => reassign(s, { username })),

  passwordChanged: newAction.of<string>("PASSWORD_CHANGED",
    (s, password) => reassign(s, { password })),

  validationStarted: newAction("VALIDATION_STARTED",
    s => reassign(s, { validating: true, error: undefined })),

  validationCompleted: newAction("VALIDATION_COMPLETED",
    s => reassign(s, { validating: false, validated: true, error: undefined })),

  validationFailed: newAction.of<string>("VALIDATION_FAILED",
    (s, error) => reassign(s, { validating: false, validated: false, error })),

  canValidateChanged: newAction.of<boolean>("CAN_VALIDATE_CHANGED",
    (s, canValidate) => reassign(s, { canValidate })),
};

export const LoginCommands = {
  validate: command("VALIDATE"),
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
