# feathers-subscriptions-manager
> A subscriptions manager for feathers.js reactive subscriptions through feathers-reactive.

The Feathers Subscription Manager allows you to wait for multiple subscriptions and then call a shared callback function. After the initial load this function will be called every time one of the subscriptions get updated.


## Requirements
This Subscriptions Manager will only work for [feathers-reactive](https://github.com/feathersjs/feathers-reactive). Please follow their [setup instructions](https://github.com/feathersjs/feathers-reactive#setting-options-and-rxjs) before you start using the "feathers-subscriptions-manager".

```
npm install --save feathers-reactive
```


## How does it work
The Feathers Subscription Manager will let you register all the subscriptions (**addSubscription()**) you want and watch them. Each of the subscriptions will have some kind of a callback action (examples below). This _action_ has to return an object, that will be merged into the Subscriptions Manager's state.

When all subscriptions have received their data the **.ready(callback(data, initial))** callback method will be called and will have the merged state object as first parameter. In this function you can e.g. have a "renderLayout" function.

The callback will now be called on every change of one of the watched subscriptions as well.

(optional) The second parameter of the callback function (_initial_) is a boolean that will let you know if it is the initial call (True) or an update call (False).


## Usage
### Set up subsManager:

```js
import { SubsManager } from 'feathers-subscriptions-manager';
const subsManager = new SubsManager();
```


### addSubscription(_cursor_, _action_)

_cursor_ is a feathers service call.

```js
const userService = app.service('users');
const findUsersCursor = userService.find(...);
```

_action_ can be a string, a function or a promise.

```js
/* Use with strings */
/* Recommended if you e.g. make a "get" call */
/* Result: {users: data} */
subsManager.addSubscription(findUsersCursor, 'users');


/* Use with function */
/* Recommended if you want to have a proxy between getting the data from the server and finishing the the call */
/* Result: {users: users.data} */
subsManager.addSubscription(findUsersCursor, (users) => {
	return {users: users.data};
});


/* Use with promise */
/* Recommended if you need to fetch additional async data before finsihing the call */
/* Result: {users: data} */
subsManager.addSubscription(findUsersCursor, (users) => {
	return new Promise((data) => {
		sleep(2000); // a long async operation
		return {users: data}
	});
});

```


### ready(callback(_data_, _inital_))

```js
subsManager.ready((data, inital) => {
	// all subscriptions are ready 
	// you can use the resulting object as "data"
	if(intial) {
		renderLayout(data);
	} else {
		updateLayout(data);
	}
});
```
