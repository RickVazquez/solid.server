import app from '../../src/app';

const assert = require('assert');

describe('\'connections\' service', () => {
  it('registered the service', () => {
    const service = app.service('connections');
    expect(service).toBeTruthy();
  });


  it('creates a connection', async () => {
    const connection = await app.service('connections').create({
      name: "Connection 1",
      url: "http://localhost:8100"
    });

    assert.equal(connection.name, 'Connection 1');
    assert.equal(connection.url, 'http://localhost:8100');
    assert.ok(connection._id !== undefined)
    assert.equal(connection.lastBlockProcessed.blockNumber, 0);
    assert.equal(connection.lastBlockProcessed.logIndex, 0);
    assert.equal(connection.lastBlockProcessed.transactionHash, '');
  });
});
