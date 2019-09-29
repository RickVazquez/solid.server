import app from '../../src/app';

describe('\'traces\' service', () => {
  it('registered the service', () => {
    const service = app.service('traces');
    expect(service).toBeTruthy();
  });
});
