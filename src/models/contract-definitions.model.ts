import { Sequelize, DataTypes, Model, BuildOptions } from 'sequelize';
import { Application } from '../declarations';

interface ContractDefinitionModel extends Model {
  readonly id: number;
  name: string;
  sourceCode: string;
  abi: string;//any[]; // TODO REVIEW DATA TYPE
  bytecode: string;
  runtimeBycode: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// Need to declare the static model so `findOne` etc. use correct types.
type ContractDefinitionStatic = typeof Model & {
  new (values?: object, options?: BuildOptions): ContractDefinitionModel;
}

export default function (app: Application) {
  const sequelize: Sequelize = app.get('sequelizeClient');

  const contractDefinitions = <ContractDefinitionStatic>sequelize.define('contract_definitions', {
    id: {
      autoIncrement: true,
      primaryKey: true,      
      type: DataTypes.INTEGER.UNSIGNED,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    sourceCode: {
      type: new DataTypes.STRING(5000),
      allowNull: false,
    },
    abi: {
      type: new DataTypes.STRING(5000),
      allowNull: false,
    },
    bytecode: {
      type: new DataTypes.STRING(5000),
      allowNull: false,
    },
    runtimeBycode: {
      type: new DataTypes.STRING(5000),
      allowNull: false,
    }
  },
  {
    hooks: {
      beforeCount(options: any) {
        options.raw = true;
      }
    },
    tableName: 'contract_definitions'
  });

  // ContractDefinition.init({
  //   id: {
  //     type: DataTypes.INTEGER.UNSIGNED, // you can omit the `new` but this is discouraged
  //     autoIncrement: true,
  //     primaryKey: true,
  //   },
   
  // }, {
  //   sequelizeClient,
  //   tableName: 'projects',
  // }); 
  // const contractDefinitions = sequelizeClient.define('contract-definitions', {
  //   text: {
  //     type: DataTypes.STRING,
  //     allowNull: false
  //   }
  // }, {
  //   
  // });

  // eslint-disable-next-line no-unused-vars
  // (contractDefinitions as any).associate = function (models: any) {
  //   // Define associations here
  //   // See http://docs.sequelizejs.com/en/latest/docs/associations/
  // };

  return contractDefinitions;
}
