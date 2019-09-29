import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
// import { Params } from 'express-serve-static-core';

import { ContractDefinition } from '@solidstudio/solid.types'

import { Application } from '../../declarations';

export class ContractDefinitions extends Service<ContractDefinition> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  // create(data: ContractDefinition, params?: Params) {
  //   return super.create(data, params);
  // }
};
