import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

import { Params } from 'express-serve-static-core';

export interface Contract {
  _id?: string
  name: string
  sourceCode: string
  abi: []
  bytecode: string
  address: string // TODO, for ALREADY DEPLOYED is fine, but for simulation?
  connectionId: string // TODO, for ALREADY DEPLOYED is fine, but for simulation?
  creationDate: string,
  lastExecutionDate: string,
  transactionCount: number
}

export class Contracts extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: Contract, params?: Params) {
    return super.create(data, params);
  }
};
