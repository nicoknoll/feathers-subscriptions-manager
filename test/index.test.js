import assert from 'assert';
import rx from 'feathers-reactive';
import feathers from 'feathers';
import memory from 'feathers-memory';
import RxJS from 'rxjs';

import { SubsManager } from '../src';

describe('feathers-subscriptions-manager', () => {
  let app, service, subsManager;

  beforeEach(done => {
    app = feathers().configure(rx(RxJS)).use('/messages', memory());

    service = app.service('messages').rx();

    service.create({
      text: 'A test message'
    }).then(() => done());

    subsManager = new SubsManager();
  });

  it('is CommonJS compatible', () => {
    let SubsManager = require('../lib');
    assert.equal(typeof SubsManager.SubsManager, 'function');
  });

  it('is setting/getting state', () => {
    subsManager.state = {a: 'b'};
    assert.deepEqual(subsManager.state, {a: 'b'});
  });

  it('is recognizing strings', () => {
    assert.equal(subsManager.isString('test'), true);
    assert.equal(subsManager.isString({}), false);
    assert.equal(subsManager.isString(42), false);
    assert.equal(subsManager.isString(() => {}), false);
  });

  it('is recognizing objects', () => {
    assert.equal(subsManager.isObject('test'), false);
    assert.equal(subsManager.isObject({}), true);
    assert.equal(subsManager.isObject({a: 'b'}), true);
    assert.equal(subsManager.isObject(42), false);
    assert.equal(subsManager.isObject(() => {}), false);
  });

  it('is recognizing functions', () => {
    assert.equal(subsManager.isFunction('test'), false);
    assert.equal(subsManager.isFunction({}), false);
    assert.equal(subsManager.isFunction({a: 'b'}), false);
    assert.equal(subsManager.isFunction(42), false);
    assert.equal(subsManager.isFunction(() => {}), true);
    assert.equal(subsManager.isFunction(function () {}), true);
  });

  it('is possible to add subscriptions', (done) => {
    const cursor = service.find();

    subsManager.addSubscription(cursor, 'resultString');

    subsManager.addSubscription(cursor, (result) => {
      return {resultFunction: result};
    });

    subsManager.ready((data, initial) => {
      assert.deepEqual(data, {
        resultString: [ { text: 'A test message', id: 0 } ],
        resultFunction: [ { text: 'A test message', id: 0 } ]
      });
      done();
    });
  });
});
