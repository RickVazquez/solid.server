import { Application } from '../declarations';
import connections from './connections/connections.service';
import contractDefinitions from './contract-definitions/contract-definitions.service';
import contracts from './contracts/contracts.service';
import transactions from './transactions/transactions.service';
import blocks from './blocks/blocks.service';
// Don't remove this comment. It's needed to format import lines nicely.

export default function (app: Application) {
  app.configure(connections);
  app.configure(contractDefinitions);
  app.configure(contracts);
  app.configure(transactions);
  app.configure(blocks);
}
