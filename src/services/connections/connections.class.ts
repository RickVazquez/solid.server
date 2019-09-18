import { Service, NedbServiceOptions } from 'feathers-nedb';
import { Application } from '../../declarations';

import { Params } from 'express-serve-static-core';

export interface BlockProcessed {
  blockNumber: number
  transactionHash: string
  logIndex: number
}

export interface Connection {
  _id: string
  name: string
  url: string
  lastBlockProcessed?: BlockProcessed
}

export class Connections extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
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
