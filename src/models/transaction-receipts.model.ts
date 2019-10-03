import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { TransactionReceipt } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface TransactionReceiptModel extends Model, TransactionReceipt {
}

type TransactionReceiptModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): TransactionReceiptModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');
  const { connections } = sequelize.models

  const transactionReceipts = <TransactionReceiptModelStatic>sequelize.define('transaction_receipts', {
    status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    transactionHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    transactionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    blockHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    blockNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    from: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    to: {
      type: DataTypes.STRING(128)
    },
    contractAddress: {
      type: DataTypes.STRING(128)
    },
    cumulativeGasUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    gasUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    // connectionId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: connections,
    //     key: 'id'
    //   }
    // }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    },
    indexes: [{
      unique: true,
      fields: ['transactionHash']
    }]
  })

  transactionReceipts.belongsTo(connections, { onDelete: 'cascade' })

  return transactionReceipts;
}
