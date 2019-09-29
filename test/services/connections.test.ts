import { buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

describe('Connections service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('connections');

    expect(service).toBeTruthy();
  });

  it('creates a connection', async () => {
    const sampleConnection = buildFakeConnection({
      id: undefined,
    })

    sampleConnection.id = undefined

    const service = app.service('connections')
    const connection = await service.create(sampleConnection);

    expect(connection.name).toEqual('Connection 1');
    expect(connection.url).toEqual('http://localhost:8545');
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)
    expect(connection.lastBlockNumberProcessed).toEqual(0)
  });
});
