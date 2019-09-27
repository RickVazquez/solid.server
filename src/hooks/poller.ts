// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html
import { Hook, HookContext } from '@feathersjs/feathers';

import { BlockchainProcessor } from '../local_modules/event-processor/BlockchainProcessor'
import { PollingService } from '../local_modules/event-processor/PollingService'
import { Web3Wrapper } from '../local_modules/web3-wrapper/Web3Wrapper'
import { Connection } from '@solidstudio/solid.types';

export default (options = {}): Hook => {
  return async (context: HookContext) => {
    console.log('Starting to process blockchain')
    const connectionService = context.app.service('connections');
    const connectionsResult = await connectionService.find()
    const connections: Connection[] = connectionsResult.data
    console.log('connections', connections)
    connections.forEach((connection) => {
      console.log('connection', connection)
      const web3Instance = new Web3Wrapper(connection.url)
      const pollingFactory = new PollingService()
      const appContext = context.app
      const blockchainProcessor = new BlockchainProcessor(connection, appContext as any, web3Instance, pollingFactory)
      blockchainProcessor.start()
    })
    return context;
  };
}
