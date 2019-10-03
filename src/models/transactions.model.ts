import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { Transaction } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface TransactionModel extends Model, Transaction {
}

type TransactionModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): TransactionModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');
  const { connections } = sequelize.models

  const transactions = <TransactionModelStatic>sequelize.define('transactions', {
    hash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    nonce: {
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
    transactionIndex: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    from: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    to: {
      type: DataTypes.STRING(128)
    },
    value: {
      type: DataTypes.STRING(128),
      allowNull: false
    },
    gasPrice: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    gas: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    input: {
      type: DataTypes.STRING(10000),
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
      fields: ['hash']
    }]
  })

  transactions.belongsTo(connections, { onDelete: 'cascade' })

  return transactions;
}
