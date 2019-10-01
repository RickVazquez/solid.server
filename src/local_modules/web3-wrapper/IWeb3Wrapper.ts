import { TransactionReceipt, Transaction } from 'web3-core'
import { Block } from 'web3-eth'

export interface IWeb3Wrapper {
  getDefaultAccount: () => Promise<string>
  getBlockNumber: () => Promise<number>
  getTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
  getTransaction: (txHash: string) => Promise<Transaction>
  getBlock: (blockNumber: number) => Promise<Block>
  getCode: (contractAddress: string) => Promise<string>
  getTransactionCount: (contractAddress: string) => Promise<number>
}
