import Web3 from 'web3'
import { TransactionReceipt } from 'web3-core'
import { Block } from 'web3-eth'

import { IWeb3Wrapper } from './IWeb3Wrapper'

// const BLOCKCHAIN_URL = process.env.BLOCKCHAIN_URL || 'http://ethnode:8545'

const options = {
  defaultBlock: 'latest',
  defaultGas: 804247552,
  defaultGasPrice: '0',
  transactionBlockTimeout: 50,
  transactionConfirmationBlocks: 1,
  transactionPollingTimeout: 480
}

export class Web3Wrapper implements IWeb3Wrapper {
  provider: any
  instance: Web3

  constructor(blockchainUrl: string) {
    const url = blockchainUrl
    console.log('BLOCKCHAIN_URL', url)
    this.instance = new Web3(url, undefined, options)
    this.provider = this.instance.currentProvider
  }

  getDefaultAccount = async (): Promise<string> => {
    const accounts = await this.instance.eth.getAccounts()
    console.log("GETTING ACCOUNTS", accounts)
    return accounts[0]
  }

  getBlockNumber = async (): Promise<number> => {
    return await this.instance.eth.getBlockNumber()
  }

  getBlock = async (blockNumber: number): Promise<Block> => {
    return await this.instance.eth.getBlock(blockNumber)
  }

  getTransactionReceipt = async (txHash: string): Promise<TransactionReceipt> => {
    return await this.instance.eth.getTransactionReceipt(txHash)
  }


  getCode = async (contractAddress: string): Promise<string> => {
    return await this.instance.eth.getCode(contractAddress)
  }

  getTransactionCount = async (contractAddress: string): Promise<number> => {
    return await this.instance.eth.getTransactionCount(contractAddress)
  }
}
