import app from '../../src/app';
import { buildFakeContractDefinition, ContractDefinition } from '@solidstudio/solid.types';


describe('ContractDefinitions service', () => {

  beforeAll(async () => {
    const sequelise = app.get('sequelizeClient')

    await sequelise.sync({ force: true })
  })

  it('registered the service', () => {
    const service = app.service('contract-definitions');

    expect(service).toBeTruthy();
  });

  it('creates a contract definition', async () => {
    const sampleContractDefinition = buildFakeContractDefinition()

    const service = app.service('contract-definitions')

    const contractDefinition: ContractDefinition = await service.create(sampleContractDefinition);

    expect(contractDefinition).toBeTruthy()
    expect(contractDefinition.name).toEqual(sampleContractDefinition.name)
    expect(contractDefinition.sourceCode).toEqual(sampleContractDefinition.sourceCode)
    expect(contractDefinition.bytecode).toEqual(sampleContractDefinition.bytecode)
    expect(contractDefinition.abi).toEqual(sampleContractDefinition.abi)
    expect(contractDefinition.id).toBeGreaterThan(0)
    expect(contractDefinition.id).toBeTruthy()
  });
});
