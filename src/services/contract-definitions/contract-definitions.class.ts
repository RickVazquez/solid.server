import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

import { Params } from 'express-serve-static-core';

export interface ContractDefinition {
  name: string
  sourceCode: string
  abi: string//any[]
  bytecode: string
  runtimeBycode: string
}

export class ContractDefinitions extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: ContractDefinition, params?: Params) {
    return super.create(data, params);
  }
};
