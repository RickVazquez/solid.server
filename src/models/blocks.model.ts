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

  const blocks = <BlockModelStatic>sequelize.define('blocks', {
    // do I need primary key? It should be blockHash..
    blockNumber: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    timestamp: {
      type: DataTypes.INTEGER.UNSIGNED,
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
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    difficulty: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    totalDifficulty: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    uncles: {
      type: DataTypes.STRING(5000), // ARRAY
      allowNull: false,
    },
    connectionId: {
      type: DataTypes.INTEGER.UNSIGNED, // FOREIGN KEY, INDEX
      allowNull: false,
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  })

  return blocks;
}
