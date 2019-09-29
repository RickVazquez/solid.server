import { buildFakeTransactionReceipt, TransactionReceipt, buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

describe('TransactionReceipts service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('transaction-receipts');

    expect(service).toBeTruthy();
  });

  it('creates a transaction receipt entry', async () => {
    const sampleConnection = buildFakeConnection()
    const sampletransactionReceipt = buildFakeTransactionReceipt()

    const transactionReceiptsService = app.service('transaction-receipts')
    const connectionService = app.service('connections')

    const connection: Connection = await connectionService.create(sampleConnection)

    expect(connection).toBeTruthy()
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)

    const transactionReceipt: TransactionReceipt = await transactionReceiptsService.create({
      ...sampletransactionReceipt,
      connectionId: connection.id
    });

    expect(transactionReceipt).toBeTruthy()
    expect(transactionReceipt.blockNumber).toEqual(sampletransactionReceipt.blockNumber)

    const transactionReceiptsResult = await transactionReceiptsService.find({
      transactionHash: sampletransactionReceipt.transactionHash
    })

    expect(transactionReceiptsResult).toBeTruthy()

    const transactionReceiptFound = transactionReceiptsResult.data[0]

    expect(transactionReceiptFound.blockNumber).toEqual(sampletransactionReceipt.blockNumber)
    expect(transactionReceiptFound.connectionId).toEqual(sampletransactionReceipt.connectionId)
    expect(transactionReceiptFound.transactionHash).toEqual(sampletransactionReceipt.transactionHash)
  })
});
