import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { Connection } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface ConnectionModel extends Model, Connection {
}

type ConnectionModelStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): ConnectionModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');

  const connections = <ConnectionModelStatic>sequelize.define('connections', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING(128),
      allowNull: false
      // validate: {
      //   isUrl: true
      // }
    },
    lastBlockNumberProcessed: {
      type: DataTypes.INTEGER,
      allowNull: false,
    }
  }, {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    }
  });

  // TODO REMOVE THIS 
  // eslint-disable-next-line no-unused-vars
  // (connections as any).associate = function (models: any) {
  //   // Define associations here
  //   // See http://docs.sequelizejs.com/en/latest/docs/associations/
  //   connections.hasMany(models.blocks, { onDelete: 'cascade' });
  //   connections.hasMany(models.transactions, { onDelete: 'cascade' });
  //   connections.hasMany(models.transaction_receipts, { onDelete: 'cascade' });
  // };
  // console.log("MODELS", sequelize.models)
  // connections.hasMany(sequelize.models.blocks, { onDelete: 'cascade' });
  // connections.hasMany(sequelize.models.transactions, { onDelete: 'cascade' });
  // connections.hasMany(sequelize.models.transaction_receipts, { onDelete: 'cascade' });

  // console.log("MODELS CONNECTIONS", sequelize.models)

  return connections;
}
