class SubsManager {

  constructor () {
    this._state = {};
    this._subscriptions = [];
    this._countSubscriptions = 0;
    this._readyCallback = () => {};
  }

  set state (obj) {
    this._state = Object.assign(this.state, obj);
  }

  get state () {
    return Object.assign({}, this._state);
  }

  isString (value) {
    return (typeof value === 'string');
  }

  isObject (value) {
    return (value !== null && typeof value === 'object');
  }

  isFunction (value) {
    return (value instanceof Function);
  }

  addSubscription (cursor, action) {
    this._countSubscriptions += 1;

    let actionCallback;

    if (this.isString(action)) {
      // use func as key for data in state
      actionCallback = this.callbackFromString.bind(this, action);
    } else if (this.isFunction(action)) {
      // execute func which has to return object
      actionCallback = this.callbackFromFunction.bind(this, action);
    } else {
      throw (new Error('Second parameter of addSubscription has to be either a string or a function.'));
    }

    this._subscriptions.push(cursor.subscribe(actionCallback.bind(this)));
  }

  callbackFromString (action, data) {
    let result = {};
    result[action] = data;
    this.state = result;
    this.subscriptionReady();
  }

  callbackFromFunction (action, data) {
    let result = action.bind(this)(data) || {};
    if (!this.isObject(result)) {
      throw (new Error('Function has to return an object.'));
    }
    this.state = action.bind(this)(data);
    this.subscriptionReady();
  }

  subscriptionReady () {
    let initial = false;
    if (this._countSubscriptions > 0) {
      this._countSubscriptions -= 1;
      initial = true;
    }

    if (this._countSubscriptions === 0) {
      this._readyCallback(this.state, initial);
    }
  }

  ready (cb) {
    this._readyCallback = cb.bind(this);
  }
}

export default {
  SubsManager
};
