import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { TransactionReceipt } from '@solidstudio/solid.types';

import { Application } from '../../declarations';

export class TransactionReceipts extends Service<TransactionReceipt> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
