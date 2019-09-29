// Initializes the `blocks` service on path `/blocks`
import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Blocks } from './blocks.class';
import createModel from '../../models/blocks.model';
import hooks from './blocks.hooks';
import { Block } from '@solidstudio/solid.types';

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'blocks': Blocks & ServiceAddons<Block>;
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
  app.use('/blocks', new Blocks(options, app));

  Model.sync({ force: true }).then(() => {
    // Get our initialized service so that we can register hooks
    const service = app.service('blocks');

    service.hooks(hooks);
  })


}
