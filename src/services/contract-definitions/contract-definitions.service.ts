// Initializes the `contract-definitions` service on path `/contract-definitions`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { ContractDefinitions } from './contract-definitions.class';
import createModel from '../../models/contract-definitions.model';
import hooks from './contract-definitions.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'contract-definitions': ContractDefinitions & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate,
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/contract-definitions', new ContractDefinitions(options, app));

  const service = app.service('contract-definitions');

  service.hooks(hooks);
}
