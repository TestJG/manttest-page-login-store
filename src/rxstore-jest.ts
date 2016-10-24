"use strict";

import "jest";
// require("babel-core/register");
// require("babel-polyfill");
// import { Observable } from "rxjs/Observable";
// import { queue } from "rxjs/scheduler/queue";
// import "rxjs/add/observable/empty";
// import "rxjs/add/observable/of";
// import "rxjs/add/operator/concat";
// import "rxjs/add/operator/do";
// import "rxjs/add/operator/first";
// import "rxjs/add/operator/filter";
// import "rxjs/add/operator/last";
// import "rxjs/add/operator/map";
// import "rxjs/add/operator/switchMap";
// import "rxjs/add/operator/timeout";
// import "rxjs/add/operator/take";
// import "rxjs/add/operator/takeLast";
// import "rxjs/add/operator/toArray";
// import "rxjs/add/operator/toPromise";
// import { reassign, Store, Action, StoreActions, StateUpdate, startEffects } from "rxstore";
// import * as deepEqual from "deep-equal";

// /* EXTRACT to rxstore-jest */
// const actionsToObservable = (acts: Action[] | Observable<Action>) =>
//   Array.isArray(acts) ? Observable.of(...acts) : acts;

// export const testUpdateEffects =
//   <TState, TStore extends Store<TState>>(
//     givenDescription: string,
//     createStore: () => TStore) => (
//       whenDescription: string,
//       expectationsDescription: string,
//       events: Action[] | Observable<Action> |
//         ((store: TStore) => (Action[] | Observable<Action>)),
//       expectations: (updates: StateUpdate<TState>[]) => any,
//       options?: {
//         timeout?: number;
//         count?: number;
//       }
//     ) => {
//       const { timeout = 40, count = 1 } = options || {};
//       describe(givenDescription, () => {
//         describe(whenDescription, () => {
//           it(expectationsDescription, () => {
//             const store = createStore();
//             const actions = typeof events === "function"
//               ? actionsToObservable(events(store))
//               : actionsToObservable(events);
//             const promise = store.update$
//               .timeout(timeout)
//               .catch(err => Observable.empty<StateUpdate<TState>>())
//               .toArray()
//               .toPromise() as PromiseLike<StateUpdate<TState>[]>;

//             startEffects(store.dispatch, actions);
//             return promise.then(expectations);
//           });
//         });    // Given a store 
//       });    // Given a store 
//     };

// export const testActionEffects =
//   <TState, TStore extends Store<TState>>(
//     givenDescription: string,
//     createStore: () => TStore) => (
//       whenDescription: string,
//       expectationsDescription: string,
//       events: Action[] | Observable<Action> |
//         ((store: TStore) => (Action[] | Observable<Action>)),
//       expectations: (action: Action[]) => any,
//       options?: {
//         timeout?: number;
//         count?: number;
//       }
//     ) => {
//       const { timeout = 40, count = 1 } = options || {};
//       describe(givenDescription, () => {
//         describe(whenDescription, () => {
//           it(expectationsDescription, () => {
//             const store = createStore();
//             const actions = typeof events === "function"
//               ? actionsToObservable(events(store))
//               : actionsToObservable(events);
//             const promise = store.action$
//               .timeout(timeout)
//               .catch(err => Observable.empty<Action>())
//               .toArray()
//               .toPromise() as PromiseLike<Action[]>;

//             startEffects(store.dispatch, actions);
//             return promise.then(expectations);
//           });
//         });    // Given a store 
//       });    // Given a store 
//     };

// export const testStateEffects =
//   <TState, TStore extends Store<TState>>(
//     givenDescription: string,
//     createStore: () => TStore) => (
//       whenDescription: string,
//       expectationsDescription: string,
//       events: Action[] | Observable<Action> |
//         ((store: TStore) => (Action[] | Observable<Action>)),
//       expectations: (states: TState[]) => any,
//       options?: {
//         timeout?: number;
//         count?: number;
//       }
//     ) => {
//       const { timeout = 40, count = 1 } = options || {};
//       describe(givenDescription, () => {
//         describe(whenDescription, () => {
//           it(expectationsDescription, () => {
//             const store = createStore();
//             const actions = typeof events === "function"
//               ? actionsToObservable(events(store))
//               : actionsToObservable(events);
//             const promise = store.state$
//               .timeout(timeout)
//               .catch(err => Observable.empty<TState>())
//               .toArray()
//               .toPromise() as PromiseLike<TState[]>;

//             startEffects(store.dispatch, actions);
//             return promise.then(expectations);
//           });
//         });    // Given a store 
//       });    // Given a store 
//     };

// export const testLastStateEffects =
//   <TState, TStore extends Store<TState>>(
//     givenDescription: string,
//     createStore: () => TStore) => (
//       whenDescription: string,
//       expectationsDescription: string,
//       events: Action[] | Observable<Action> |
//         ((store: TStore) => (Action[] | Observable<Action>)),
//       expectations: (state: TState) => any,
//       options?: {
//         timeout?: number;
//         count?: number;
//       }
//     ) => {
//       const { timeout = 40, count = 1 } = options || {};
//       describe(givenDescription, () => {
//         describe(whenDescription, () => {
//           it(expectationsDescription, () => {
//             const store = createStore();
//             const actions = typeof events === "function"
//               ? actionsToObservable(events(store))
//               : actionsToObservable(events);
//             const promise = store.state$
//               .timeout(timeout)
//               .catch(err => Observable.empty<TState>())
//               .last()
//               .toPromise() as PromiseLike<TState>;

//             startEffects(store.dispatch, actions);
//             return promise.then(expectations);
//           });
//         });    // Given a store 
//       });    // Given a store 
//     };

// export const expectAction = (actions: Action[], action: Action) =>
//   expect(actions.filter(a => a.type === action.type)).toEqual([action]);

// export const expectItem = <T>(items: T[], item: T) =>
//   expect(items.filter(s => deepEqual(s, item))).toEqual([item]);
