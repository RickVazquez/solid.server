import { Service, SequelizeServiceOptions } from 'feathers-sequelize';

import { Block } from '@solidstudio/solid.types';

import { Application } from '../../declarations';

export class Blocks extends Service<Block> {
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
  }
}
