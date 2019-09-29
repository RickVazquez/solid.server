import app from '../../src/app';

describe('\'transaction-receipts\' service', () => {
  it('registered the service', () => {
    const service = app.service('transaction-receipts');
    expect(service).toBeTruthy();
  });
});
