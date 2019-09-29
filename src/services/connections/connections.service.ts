// Initializes the `connections` service on path `/connections`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Connections } from './connections.class';
import createModel from '../../models/connections.model';
import hooks from './connections.hooks';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'connections': Connections & ServiceAddons<any>;
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
  app.use('/connections', new Connections(options, app));

  // Model.sync().then(() => {
  //   // Get our initialized service so that we can register hooks
  //   const service = app.service('connections');
  //   service.hooks(hooks);
  // })

  // Get our initialized service so that we can register hooks

  // lastBlockProcessed
  // lastTransactionProcessed
  // lastLogIndexProcessed

  // (service as any).docs = {
  //   description: 'Service to manage projects',
  //   definitions: {
  //     'connections_list': {
  //       $ref: '#/definitions/connections'
  //     },
  //     connections: {
  //       "type": "object",
  //       "required": ["name", "description"],
  //       "properties": {
  //         "name": {
  //           "type": "string",
  //           "description": "Connection name"
  //         },
  //         "url": {
  //           "type": "string",
  //           "description": "Connection description"
  //         }
  //       }
  //     }
  //   }
  // };

  const service = app.service('connections');
  service.hooks(hooks);
  // service.hooks(hooks);
  // app.use('/connections', service);
}

