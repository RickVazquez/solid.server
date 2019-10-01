import { buildFakeTrace, TransactionTrace, buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

describe('Traces service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('traces');
    expect(service).toBeTruthy();
  });

  it('inserts a trace entry correctly', async () => {
    const sampleConnection = buildFakeConnection()
    const sampleTrace = buildFakeTrace()

    const transactionTraceService = app.service('traces')
    const connectionService = app.service('connections')

    const connection: Connection = await connectionService.create(sampleConnection)

    expect(connection).toBeTruthy()
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)

    const transactionTrace: TransactionTrace = await transactionTraceService.create({
      ...sampleTrace,
      connectionId: connection.id
    });

    expect(transactionTrace).toBeTruthy()
    expect(transactionTrace.transactionHash).toEqual(sampleTrace.transactionHash)

    const transactionTraceResult = await transactionTraceService.find({
      transactionHash: sampleTrace.transactionHash
    })

    const transactionTraceFound: TransactionTrace = transactionTraceResult.data[0]

    expect(transactionTraceFound).toBeTruthy()
    expect(transactionTraceFound.gas).toEqual(sampleTrace.gas)
    expect(transactionTraceFound.returnValue).toEqual(sampleTrace.returnValue)
    expect(transactionTraceFound.transactionHash).toEqual(sampleTrace.transactionHash)
    expect(transactionTraceFound.connectionId).toEqual(connection.id)
    expect(transactionTraceFound.structLogs).toBeDefined()
    expect(transactionTraceFound.structLogs).toEqual(sampleTrace.structLogs)
  })
});
