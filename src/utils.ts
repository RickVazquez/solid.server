import { Application } from './declarations';

import { buildFakeContractDefinitions } from './services/contract-definitions/faker'
import { ContractDefinition } from './services/contract-definitions/contract-definitions.class';


export const removeAllContractDefinitions = async (app: Application) => {
    const contractDefinitionsService = app.service('contract-definitions');
    await contractDefinitionsService.remove(null)
}

export const addContractDefinitionsFromFaker = async (app: Application) => {
    const contractDefinitionsService = app.service('contract-definitions');
    const contractDefinitions = buildFakeContractDefinitions()
    const contractDefinitions1: ContractDefinition = contractDefinitions[0]
    const contractDefinitions2: ContractDefinition = contractDefinitions[1]
    await contractDefinitionsService.create(contractDefinitions1)
    await contractDefinitionsService.create(contractDefinitions2)
}