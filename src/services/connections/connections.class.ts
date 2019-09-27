import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Params } from 'express-serve-static-core';

import { Connection } from '@solidstudio/solid.types'
import { Application } from '../../declarations';

export class Connections extends Service {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: Connection, params?: Params) {
    const defaultLastBlockProcessed = {
      blockNumber: 0,
      transactionHash: '',
      logIndex: 0
    }

    const connectionDataToInsert = {
      ...data,
      lastBlockProcessed: defaultLastBlockProcessed
    }

    return super.create(connectionDataToInsert, params);
  }
};
