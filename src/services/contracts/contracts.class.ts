import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Params } from 'express-serve-static-core';

import { Application } from '../../declarations';

import { Contract } from '@solidstudio/solid.types'

export class Contracts extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: Contract, params?: Params) {
    return super.create(data, params);
  }
};
