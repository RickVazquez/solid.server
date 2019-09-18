import { TransactionReceipt } from 'web3-core'
import { Block } from 'web3-eth'

export interface IWeb3Wrapper {
  getDefaultAccount: () => Promise<string>
  getBlockNumber: () => Promise<number>
  getTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
  getBlock: (blockNumber: number) => Promise<Block>
  getCode: (contractAddress: string) => Promise<string>
  getTransactionCount: (contractAddress: string) => Promise<number>
}
