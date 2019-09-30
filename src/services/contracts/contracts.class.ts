import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
// import { Params } from 'express-serve-static-core';
import { Contract } from '@solidstudio/solid.types'

import { Application } from '../../declarations';

export class Contracts extends Service<Contract> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
  // create(data: Contract, params?: Params) {
  //   return super.create(data, params);
  // }
};
