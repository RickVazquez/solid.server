import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Params } from 'express-serve-static-core';

import { Connection } from '@solidstudio/solid.types'

import { Application } from '../../declarations';

export class Connections extends Service<Connection> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }

  create(data: Connection, params?: Params): Promise<Connection> {
    const connectionDataToInsert = {
      ...data,
      lastBlockNumberProcessed: 0
    }
    return super.create(connectionDataToInsert, params);
  }
}