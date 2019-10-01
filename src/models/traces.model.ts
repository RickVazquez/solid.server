import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { TransactionTrace } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface TransactionTraceModel extends Model, TransactionTrace {
}

type TransactionTraceModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): TransactionTraceModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');
  const { connections } = sequelize.models

  const traces = <TransactionTraceModelStatic>sequelize.define('traces', {
    transactionHash: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    gas: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    returnValue: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    structLogs: {
      type: DataTypes.JSON,
      allowNull: false
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
      fields: ['transactionHash']
    }]
  });

  return traces;
}
