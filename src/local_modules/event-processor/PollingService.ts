import AsyncPolling from 'async-polling'

import { IBlockchainProcessor } from './IBlockchainProcessor'
import { IPollingService } from './IPollingService'

export class PollingService implements IPollingService {
  public createPolling(pollingFunction: (end) => void, intervalMs: number): IBlockchainProcessor {
    const asyncPolling = AsyncPolling(pollingFunction, intervalMs)
    return {
      start: () => asyncPolling.run(),
      stop: () => asyncPolling.stop()
    }
  }
}
