import app from '../../src/app';

describe('\'contracts\' service', () => {
  it('registered the service', () => {
    const service = app.service('contracts');
    expect(service).toBeTruthy();
  });
});
