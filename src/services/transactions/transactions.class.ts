import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { Transaction } from '@solidstudio/solid.types';

import { Application } from '../../declarations';

export class Transactions extends Service<Transaction> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
};
