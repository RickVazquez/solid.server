// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

import { Connection } from '@solidstudio/solid.types';

import { BlockchainSynchronizer } from '../local_modules/event-processor/BlockchainSynchronizer';
import { PollingService } from '../local_modules/event-processor/PollingService'

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    console.log("Running hook after create connection")
    await startPolling(context)
    return context;
  };
}

const startPolling = async (context: HookContext) => {
  const connection: Connection = context.result
  console.log('Starting to process blockchain')
  const pollingFactory = new PollingService()
  const appContext = context.app
  const blockchainProcessor = new BlockchainSynchronizer(connection, pollingFactory, appContext as any)
  // TODO: Analyse better this mechanism
  context.app.set(`blockchainProcessor-${connection.id}`, blockchainProcessor);
  return await blockchainProcessor.start()
}