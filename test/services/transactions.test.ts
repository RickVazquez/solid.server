import { buildFakeTransaction, Transaction, buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

describe('Transactions service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('transactions');
    expect(service).toBeTruthy();
  });

  it('creates a transaction entry', async () => {
    const sampleConnection = buildFakeConnection()
    const sampleTransaction = buildFakeTransaction()

    console.log("TRANSACTION SAMPLE", sampleTransaction)

    const transactionsService = app.service('transactions')
    const connectionService = app.service('connections')

    const connection: Connection = await connectionService.create(sampleConnection)

    expect(connection).toBeTruthy()
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)

    const transaction: Transaction = await transactionsService.create({
      ...sampleTransaction,
      connectionId: connection.id
    });

    expect(transaction).toBeTruthy()
    expect(transaction.blockNumber).toEqual(sampleTransaction.blockNumber)

    // const transactionFound = await transactionsService.find({
    //   hash: transaction.hash
    // })

    // expect(transactionFound).toBeTruthy()
    // console.log("TRANSACTION FOUND", transactionFound)
    // expect(transactionFound.data[0].transactions).toHaveLength(sampleBlock.transactions.length)
    // expect(transactionFound.data[0].blockNumber).toEqual(sampleBlock.blockNumber)
    // expect(transactionFound.data[0].connectionId).toEqual(sampleBlock.connectionId)
    // expect(transactionFound.data[0].hash).toEqual(sampleBlock.hash)
  })
});
