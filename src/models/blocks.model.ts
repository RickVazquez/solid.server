import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { Block } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface BlockModel extends Model, Block {
}

type BlockModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): BlockModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');
  const { connections } = sequelize.models

  const blocks = <BlockModelStatic>sequelize.define('blocks', {
    // do I need primary key? It should be blockHash..
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    hash: {
      type: DataTypes.STRING(128), // INDEX
      allowNull: false,
    },
    parentHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    nonce: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    sha3Uncles: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    logsBloom: {
      type: DataTypes.STRING(5000),
      allowNull: false,
    },
    transactionsRoot: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    stateRoot: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    miner: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    extraData: {
      type: DataTypes.STRING(5000),
      allowNull: false
    },
    gasLimit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiptRoot: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    transactions: {
      type: DataTypes.STRING(5000), // ARRAY
      allowNull: false,
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalDifficulty: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    uncles: {
      type: DataTypes.STRING(5000), // ARRAY
      allowNull: false,
    },
    connectionId: {
      type: DataTypes.INTEGER,
      references: {
        model: connections,
        key: 'id'
      }
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    },
    indexes: [{
      unique: true,
      fields: ['blockNumber']
    }]
    // {
    // unique: true,
    // fields: ['hash']
    // }
  })

  return blocks;
}
