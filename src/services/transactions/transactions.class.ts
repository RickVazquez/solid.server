import { Service, NedbServiceOptions } from 'feathers-nedb';
import { TransactionReceipt } from 'web3-core'

import { Params } from 'express-serve-static-core';

import { Application } from '../../declarations';

export interface Transaction extends TransactionReceipt {
  connectionId: string
}

export class Transactions extends Service {
  constructor(options: Partial<NedbServiceOptions>, app: Application) {
    super(options);
  }

  create(data: TransactionReceipt, params?: Params) {
    return super.create(data, params);
  }
};
