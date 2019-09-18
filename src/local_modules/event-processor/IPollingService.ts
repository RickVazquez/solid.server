import { IBlockchainProcessor } from './IBlockchainProcessor'

export interface IPollingService {
  createPolling(pollingFunction: (end) => void, intervalMs: number): IBlockchainProcessor
}
