// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

import { BlockchainSynchronizer } from '../local_modules/event-processor/BlockchainSynchronizer';

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    // TODO: Analyse better this mechanism
    console.log("Calling before delete connection hook")
    const connectionId = context.id
    const blockchainProcessor: BlockchainSynchronizer = context.app.get(`blockchainProcessor-${connectionId}`);
    await blockchainProcessor.stop()
    return context;
  };
}