import { buildFakeBlock, Block, buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

// const delay = (ms: number) => {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

describe('Blocks service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('blocks');

    expect(service).toBeTruthy();
  });

  it('creates a block entry', async () => {
    const sampleConnection = buildFakeConnection()
    const sampleBlock = buildFakeBlock()

    const blockService = app.service('blocks')
    const connectionService = app.service('connections')

    const connection: Connection = await connectionService.create(sampleConnection)

    expect(connection).toBeTruthy()
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)

    const block: Block = await blockService.create({
      ...sampleBlock,
      connectionId: connection.id
    });

    expect(block).toBeTruthy()
    expect(block.blockNumber).toEqual(sampleBlock.blockNumber)

    const blockFound = await blockService.find({
      hash: block.hash
    })

    expect(blockFound).toBeTruthy()
    expect(blockFound.data[0].transactions).toHaveLength(sampleBlock.transactions.length)
    expect(blockFound.data[0].blockNumber).toEqual(sampleBlock.blockNumber)
    expect(blockFound.data[0].connectionId).toEqual(sampleBlock.connectionId)
    expect(blockFound.data[0].hash).toEqual(sampleBlock.hash)
  })

});
