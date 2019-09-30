import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';

import { ContractDefinition } from '@solidstudio/solid.types';

import { Application } from '../declarations';

interface ContractDefinitionModel extends Model, ContractDefinition {

}

type ContractDefinitionStatic = typeof Model & {
  new(values?: object, options?: BuildOptions): ContractDefinitionModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');

  const contractDefinitions = <ContractDefinitionStatic>sequelize.define('contract_definitions', {
    id: {
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    sourceCode: {
      type: new DataTypes.STRING(10000),
      allowNull: false,
    },
    abi: {
      type: new DataTypes.STRING(10000),
      allowNull: false,
    },
    bytecode: {
      type: new DataTypes.STRING(10000),
      allowNull: false,
    },
    runtimeBycode: {
      type: new DataTypes.STRING(10000),
      allowNull: false,
    }
  },
    {
      hooks: {
        beforeCount(options: any) {
          options.raw = true;
        }
      },
      // TODO FUTURE, check if I need indexes
      // indexes: [{
      //   unique: true,
      //   fields: ['runtimeBycode']
      // }]
    });

  return contractDefinitions;
}
