// Initializes the `traces` service on path `/traces`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Traces } from './traces.class';
import createModel from '../../models/traces.model';
import hooks from './traces.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'traces': Traces & ServiceAddons<any>;
  }
}

export default function (app: Application) {
  const Model = createModel(app);
  const paginate = app.get('paginate');

  const options = {
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/traces', new Traces(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('traces');

  service.hooks(hooks);
}
