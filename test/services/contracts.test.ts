import { Contract, buildFakeContract, buildFakeConnection, Connection } from '@solidstudio/solid.types';

import app from '../../src/app';

describe('Contracts service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('contracts');

    expect(service).toBeTruthy();
  });

  it('creates a contract', async () => {
    const sampleConnection = buildFakeConnection()
    const sampleContract = buildFakeContract()

    const service = app.service('contracts')
    const connectionService = app.service('connections')

    const connection: Connection = await connectionService.create(sampleConnection)

    expect(connection).toBeTruthy()
    expect(connection.id).toBeTruthy()
    expect(connection.id).toBeGreaterThan(0)

    const contract: Contract = await service.create({
      ...sampleContract,
      connectionId: connection.id
    });

    expect(contract).toBeTruthy()
    expect(contract.name).toEqual(sampleContract.name)

    const contractFoundResult = await service.find({
      address: sampleContract.address
    })

    expect(contractFoundResult).toBeTruthy()

    const contractFound: Contract = contractFoundResult.data[0];

    expect(contractFound.id).toBeGreaterThan(0)
    expect(contractFound.id).toBeTruthy()
    expect(contractFound.name).toEqual(sampleContract.name)
    expect(contractFound.sourceCode).toEqual(sampleContract.sourceCode)
    expect(contractFound.abi).toEqual(sampleContract.abi)
    expect(contractFound.bytecode).toEqual(sampleContract.bytecode)
    expect(contractFound.runtimeBycode).toEqual(sampleContract.runtimeBycode)
    expect(contractFound.address).toEqual(sampleContract.address)
    expect(contractFound.connectionId).toEqual(connection.id)
    expect(contractFound.creationDate).toBeTruthy()
    expect(contractFound.lastExecutionDate).toBeTruthy()
    expect(contractFound.transactionCount).toBeGreaterThan(0)

  });
});
