import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Params } from 'express-serve-static-core';

import { Transaction } from '@solidstudio/solid.types';

import { Application } from '../../declarations';

export class Transactions extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: Transaction, params?: Params) {
    return super.create(data, params);
  }
};
