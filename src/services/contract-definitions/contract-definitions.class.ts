import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

import { Params } from 'express-serve-static-core';

export interface ContractDefinition {
  name: string
  sourceCode: string
  abi: any[]
  bytecode: string
  runtimeBycode: string
}

export class ContractDefinitions extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }

  create(data: ContractDefinition, params?: Params) {
    return super.create(data, params);
  }
};
