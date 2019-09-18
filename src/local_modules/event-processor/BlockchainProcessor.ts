// import RateLimiter from "./RateLimiter";
import Bottleneck from 'bottleneck'
import { TransactionReceipt } from 'web3-core'

import { Application } from '../../declarations'

import { IWeb3Wrapper } from '../web3-wrapper/IWeb3Wrapper'

import { Connection, Connections, BlockProcessed } from '../../services/connections/connections.class'

import { IBlockchainProcessor } from './IBlockchainProcessor'
import { IPollingService } from './IPollingService'
import { Transactions, Transaction } from '../../services/transactions/transactions.class'
import { ContractDefinitions, ContractDefinition } from '../../services/contract-definitions/contract-definitions.class'
import { Contract, Contracts } from '../../services/contracts/contracts.class'

const POLLING_INTERVAL = 1000 // TODO, move to factory, singleton class

export class BlockchainProcessor implements IBlockchainProcessor {
  asyncPolling: IBlockchainProcessor
  web3Wrapper: IWeb3Wrapper
  connection: Connection
  connectionService: Connections
  transactionsService: Transactions
  contractDefinitionsService: ContractDefinitions
  contractsService: Contracts

  readonly rateLimitedGetTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
  readonly rateLimitedGetBlock: (blockNumber: number) => Promise<any>
  readonly rateLimitedGetBlockNumber: () => Promise<number>
  private readonly limiter: Bottleneck

  constructor(connection: Connection, app: Application, web3Wrapper: IWeb3Wrapper, pollingServiceFactory: IPollingService) {

    this.limiter = new Bottleneck({
      maxConcurrent: 1,
      minTime: parseInt(process.env.BLOCKCHAIN_MAX_REQUESTS_PER_SECOND || '10', undefined)
    })

    this.connectionService = app.service('connections')
    this.transactionsService = app.service('transactions')
    this.contractDefinitionsService = app.service('contract-definitions')
    this.contractsService = app.service('contracts')
    this.connection = connection
    this.web3Wrapper = web3Wrapper
    console.log("Web wrapper", web3Wrapper)
    // const rateLimiter: RateLimiter = new RateLimiter(parseInt(process.env.BLOCKCHAIN_MAX_REQUESTS_PER_SECOND || '10'));
    this.rateLimitedGetTransactionReceipt = this.limiter.wrap(this.web3Wrapper.getTransactionReceipt.bind(this))
    this.rateLimitedGetBlockNumber = this.limiter.wrap(this.web3Wrapper.getBlockNumber.bind(this))
    this.rateLimitedGetBlock = this.limiter.wrap(this.web3Wrapper.getBlock.bind(this))

    this.asyncPolling = pollingServiceFactory.createPolling(async end => {
      await this.getBlocks()
      end()
    }, POLLING_INTERVAL)
  }

  async start() {
    this.asyncPolling.start()
  }

  async stop() {
    this.asyncPolling.stop()
  }

  async processBlock(lastBlock: BlockProcessed, blockNumber: number) {
    console.log(`Processing block ${blockNumber}`)
    const processedBlock = false
    const txProcessed = 0
    try {
      const block = await this.rateLimitedGetBlock(blockNumber)
      const transactions = block.transactions
      let transactionStart = 0
      console.log('Transactions', block.transactions)
      if (lastBlock.blockNumber === blockNumber) {
        // const transactionsAsString = transactions.map((item) => {
        //     return item.value;
        // })
        transactionStart = transactions.indexOf(lastBlock.transactionHash)
        console.log('transactionStart', transactionStart)
        // If we are processing the first block
        if (transactionStart === -1) {
          transactionStart = 0
        }
      }
      for (const tx of transactions.slice(transactionStart, transactions.length)) {
        console.log('Transaction', tx)
        await this.processTransaction(lastBlock, blockNumber, tx as any)
      }
    } catch (error) {
      console.error(`BlockProcessingError: Error processing block ${blockNumber}. Retrying`)
      console.log(`Error message: ${error.message}`)
    }
  }

  private async getBlocks() {
    console.log('Starting getBlocks')
    try {
      const blockNumber = await this.rateLimitedGetBlockNumber()
      if (!this.connection.lastBlockProcessed) {
        throw new Error("Connection lastBlockProcessed is undefined")
      }
      const lastProcessedBlockNumber = this.connection.lastBlockProcessed.blockNumber
      console.log('lastProcessedBlockNumber inside', lastProcessedBlockNumber)

      if (lastProcessedBlockNumber > blockNumber) {
        console.error(
          'BlockNumberInconsistency: Last processed block in DB is higher than last block in the blockchain'
        )
        console.log(
          `BlockNumberInconsistency BlockNumber: ${blockNumber}, lastProcessedBlockNumber: ${lastProcessedBlockNumber}`
        )
        return
      }
      console.log('lastProcessedBlockNumber', lastProcessedBlockNumber)
      const blocksSequence = this.sequenceBetween(lastProcessedBlockNumber, blockNumber)
      for (const block of blocksSequence) {
        await this.processBlock(this.connection.lastBlockProcessed, block)
      }
    } catch (error) {
      console.error(`Error processing blocks, retrying, ${error.message}, ${this.rateLimitedGetBlockNumber}`)
    }
  }

  private async processTransaction(lastBlock: BlockProcessed, blockNumber: number, txHash: string) {
    console.log(`Processing transaction ${txHash}, blocknumber: ${blockNumber}`)
    // let logIndexStart = 0
    // if (lastBlock.transactionHash === txHash) {
    //     logIndexStart = lastBlock.logIndex + 1
    // }
    if (lastBlock.transactionHash === txHash) {
      return
    }
    const receipt = await this.rateLimitedGetTransactionReceipt(txHash)
    if (receipt) {

      //TODO NOW: I Need to push the transaction receipt 
      // this.connection.transactionReceipts.push(receipt)
      const newTransaction: Transaction = {
        ...receipt,
        connectionId: this.connection._id
      }

      await this.transactionsService.create(newTransaction)

      // TODO: This may be abstracted differently
      if (receipt.contractAddress) { // if it is contractCreation
        const runtimeByteCode = await this.web3Wrapper.getCode(receipt.contractAddress)
        const transactionCount = await this.web3Wrapper.getTransactionCount(receipt.contractAddress)

        console.log("runtimeByteCode from web3", runtimeByteCode)
        const contractDefinitionsResult = await this.contractDefinitionsService.find()
        const allExistingRuntimeBytecode = contractDefinitionsResult.data

        const itemFound = allExistingRuntimeBytecode.find((element: ContractDefinition) => {
          console.log("allExistingRuntimeBytecode find element", element.runtimeBycode)
          return element.runtimeBycode === runtimeByteCode
        });

        const newContract: Contract = {
          name: itemFound ? itemFound.name : "--",
          sourceCode: itemFound ? itemFound.sourceCode : "--",
          abi: itemFound ? itemFound.abi : [],
          bytecode: itemFound ? itemFound.bytecode : "",
          address: receipt.contractAddress,
          connectionId: this.connection._id,
          creationDate: new Date().toLocaleDateString(),
          lastExecutionDate: new Date().toLocaleDateString(),
          transactionCount: transactionCount
        }

        this.contractsService.create(newContract)
      }

      if (this.connection.lastBlockProcessed) {
        this.connection.lastBlockProcessed.blockNumber = blockNumber
        this.connection.lastBlockProcessed.transactionHash = txHash
        await this.connectionService.update(this.connection._id, this.connection)
      }


    }
    // const logs = receipt.logs
    // console.log("LOGS", logs) // why do I need the logs?
    // if (!Array.isArray(logs) || !logs.length) {
    //     console.log(`Saving empty transaction: ${txHash}, blockNumber: ${blockNumber}`)

    //     const newLastBlockProcessed = {
    //         blockNumber,
    //         transactionHash: txHash,
    //         logIndex: 0
    //     }

    //     this.connection.lastBlockProcessed = newLastBlockProcessed
    //     await this.repository.update(this.connection._id, this.connection)
    // }
    // then, I need to save the transactions too
    // for (const log of logs.slice(logIndexStart, logs.length)) {
    //     const logIndex = logs.indexOf(log)
    //     const eventObject = this.createEventObject(log, blockNumber, txHash, receipt.transactionIndex, logIndex)
    //     // I think I need to store the events too..
    //     try {
    //         console.log(`Event detected. Saving to the database, blockNumber: ${blockNumber}, transaction hash: ${txHash}, log index: ${logIndex}`)
    //         // Save event to the database eventObject
    //     } catch (error) {
    //         console.error('Unable to save the event in the database, trying again later ', {
    //             blockNumber,
    //             txHash,
    //             index: logIndex,
    //             error: 'proccessingEvent',
    //             errorMessage: error.message
    //         })
    //         return
    //     }

    //     const newLastBlockProcessed = {
    //         blockNumber,
    //         transactionHash: txHash,
    //         logIndex: logIndex
    //     }

    //     this.connection.lastBlockProcessed = newLastBlockProcessed
    //     await this.repository.update(this.connection._id, this.connection)
    // }
  }

  private createEventObject(log: any, blockNumber: number, txHash: string, txIndex, logIndex: number): IEventObject {
    const eventObject: IEventObject = {
      contractAddress: log.address,
      data: log.data,
      blockNumber,
      transactionIndex: txIndex,
      transactionHash: txHash,
      logIndex
    }
    return eventObject
  }

  private sequenceBetween(start: number, end: number): number[] {
    return Array(end - start + 1)
      .fill(Number)
      .map((_, idx) => start + idx)
  }
}

interface IEventObject {
  contractAddress: string
  data: string
  blockNumber: number
  transactionHash: string
  transactionIndex: number
  logIndex: number
}


/**

No tengo migrations, pero para demo
*/