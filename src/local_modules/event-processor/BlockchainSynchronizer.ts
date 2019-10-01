// After I add a connection I start the Blockckhain event processor

// Probably when I create the connection, I can validate 2 things
// #1 that the node is alive, then I can get the last blockNumber
// then when I create the connection I can know the latestBlockNumber
// Then when I start synchronizing, I already know where I should start
// As default the connection has status: Synchronizing

// Status: Synchronizing, Synchronized, Error (When it is not listening)

// BlockchainEventProcessor.StartSynchronizing();

// Block period as property

// 2 modes: 
// when isSynchronizing, full poll
// otherwise a job scheduler, every 10 seconds, or get block period
// to manage time

/**
 * en Batch and retry until block is processed
 * then bulk save
 *
 * Coordinator
 *
 * Operations
 * getBlockNumber
 * getBlock
 * getTransaction
 * getTransactionReceipt
 * getCode
 * getTransactionCount* (could be skip for contract creation)
 *
 *
 * Parameters
 *
 * Transactions per second = 5
 *
 * Get block number
 * Get last block processed
 * Start from there
 * Get block
 * Save block
 * Get transactions
 * Save transactions
 * Get transaction receipts
 * Save transaction receipts
 *
 *
 */
import Bottleneck from 'bottleneck'
import { Sequelize } from 'sequelize';

import { Connection, Transaction, ContractDefinition, Contract, TransactionReceipt, Block, buildFakeBlock, buildFakeTransactionReceipt, buildFakeTransaction, buildFakeTransactions, buildFakeTransactionReceipts } from '@solidstudio/solid.types'

import { Application } from '../../declarations'
import { IWeb3Wrapper } from '../web3-wrapper/IWeb3Wrapper'

// services
import { ContractDefinitions } from '../../services/contract-definitions/contract-definitions.class'
import { TransactionReceipts } from '../../services/transaction-receipts/transaction-receipts.class';
import { Transactions } from '../../services/transactions/transactions.class'
import { Connections } from '../../services/connections/connections.class'
import { Contracts } from '../../services/contracts/contracts.class'
import { Blocks } from '../../services/blocks/blocks.class'


import { IPollingService } from './IPollingService'
import { IBlockchainProcessor } from './IBlockchainProcessor'

export class BlockchainSynchronizer implements IBlockchainProcessor {

    private readonly asyncPolling: IBlockchainProcessor // TODO: Rename
    private readonly web3Wrapper: IWeb3Wrapper
    private readonly connection: Connection
    private readonly startTime: number
    private readonly limiter: Bottleneck
    private readonly sequelize: Sequelize;

    // services
    private readonly connectionService: Connections
    private readonly transactionsService: Transactions
    private readonly contractDefinitionsService: ContractDefinitions
    private readonly contractsService: Contracts
    private readonly blocksService: Blocks
    private readonly transactionReceiptsService: TransactionReceipts
    private readonly rateLimitedGetTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
    private readonly rateLimitedGetTransaction: (txHash: string) => Promise<Transaction>
    private readonly rateLimitedGetBlock: (blockNumber: number) => Promise<Block>
    private readonly rateLimitedGetBlockNumber: () => Promise<number>
    private readonly rateLimitedGetTransactionCount: (contractAddress: string) => Promise<number>
    private readonly rateLimitedGetCode: (contractAddress: string) => Promise<string>

    constructor(connection: Connection, pollingServiceFactory: IPollingService, app: Application, web3Wrapper: IWeb3Wrapper) {
        this.connectionService = app.service('connections')
        this.transactionsService = app.service('transactions')
        this.transactionReceiptsService = app.service('transaction-receipts')
        this.blocksService = app.service('blocks')
        this.contractDefinitionsService = app.service('contract-definitions')
        this.contractsService = app.service('contracts')

        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 210
        })

        this.sequelize = app.get('sequelizeClient');
        this.connection = connection
        this.startTime = Date.now()
        this.web3Wrapper = web3Wrapper

        this.rateLimitedGetTransaction = this.limiter.wrap(this.getTransaction.bind(this))
        this.rateLimitedGetTransactionReceipt = this.limiter.wrap(this.getTransactionReceipt.bind(this))
        this.rateLimitedGetBlockNumber = this.limiter.wrap(this.getBlockNumber.bind(this)) // TODO: to change by real web3 wrapper
        this.rateLimitedGetBlock = this.limiter.wrap(this.getBlock.bind(this))
        this.rateLimitedGetTransactionCount = this.limiter.wrap(this.getTransactionCount.bind(this))
        this.rateLimitedGetCode = this.limiter.wrap(this.getCode.bind(this))

        this.asyncPolling = pollingServiceFactory.createPolling(async (end) => {
            await this.synchronize()
            end()
        }, 1000) // TODO: this.connection.blockPeriodTime
    }

    async start() {
        this.asyncPolling.start()
    }

    async stop() {
        this.asyncPolling.stop()
    }

    async synchronize() {
        const connectionId = this.connection.id || 0
        const connectionResult = await this.connectionService.get(connectionId)
        const connection: Connection = connectionResult.data;
        const lastProcessedBlockNumber = connection.lastBlockNumberProcessed || 0;

        const blockNumber = await this.rateLimitedGetBlockNumber()

        if (lastProcessedBlockNumber > blockNumber) {
            console.error('BlockNumberInconsistency: Last processed block in DB is higher than last block in the blockchain')
            console.log(`BlockNumberInconsistency BlockNumber: ${blockNumber}, lastProcessedBlockNumber: ${lastProcessedBlockNumber}`)
            return
        }

        console.log(`BlockNumber: ${blockNumber}, lastProcessedBlockNumber: ${lastProcessedBlockNumber}`)

        const blocksSequence = this.sequenceBetween(lastProcessedBlockNumber, blockNumber)
        for (const blockNumber of blocksSequence) {
            const block = await this.rateLimitedGetBlock(blockNumber)
            const transactionReceipts = await this.getTransactionReceipts(block)
            const transactions = await this.getTransactions(block)
            const contracts = await this.getContracts(transactionReceipts)

            console.log("Block", block)
            console.log("TransactionReceipts", transactionReceipts)
            console.log("Transactions", transactions)
            console.log("Contracts", contracts)
            // store in DB as a transaction or simply store to the database using services...
            // TRANSACTION
            // Save Block
            // Save TransactionReceipts
            // Save Transactions
            // Update Current Connection (Last block processed)

            const { Block, Transaction, TransactionReceipt } = this.sequelize.models;

            // app.get('sequelizeClient').transaction(transOptions, transaction => {
            //     return app.service('serviceName').create({data},{ sequelize: { transaction}  })
            // })
            return this.sequelize.transaction(transaction => {
                return this.blocksService.create(block, { sequelize: { transaction } })
                    .then((whatIsThis) => {
                        console.log("whatIsThis blocks", whatIsThis)
                        return this.transactionsService.create(transactions, { sequelize: { transaction } })
                            .then((whatIsThis) => {
                                console.log("whatIsThis transactionsService", whatIsThis)
                                return this.transactionReceiptsService.create(transactionReceipts, { sequelize: { transaction } })
                                    .then((whatIsThis) => {
                                        console.log("whatIsThis transactionReceiptsService", whatIsThis)
                                        if (this.connection.id) {
                                            return this.connectionService.update(this.connection.id, {
                                                lastBlockNumberProcessed: blockNumber
                                            })
                                        }
                                    })
                            })
                    })
            }).then(result => {
                console.log("TRANSACTION SUCCESSFUL", result)
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
            }).catch(err => {
                console.log("TRANSACTION ERROR", err)
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
            });
        }


    }

    async getContracts(transactionReceipts: TransactionReceipt[]) {
        const result: Contract[] = []

        const contractsCreationReceipts = transactionReceipts.filter((item) => {
            return item.contractAddress != null && item.contractAddress !== undefined;
        })

        contractsCreationReceipts.forEach(async (item) => {
            const runtimeByteCode = item.contractAddress ? await this.rateLimitedGetCode(item.contractAddress) : ""
            const transactionCount = item.contractAddress ? await this.rateLimitedGetTransactionCount(item.contractAddress) : 0

            console.log("runtimeByteCode from web3", runtimeByteCode)
            console.log("transaction count from web3", transactionCount)

            const contractDefinitionsResult = await this.contractDefinitionsService.find({
                runtimeByteCode
            })

            const existingContractDefinitions: ContractDefinition[] = contractDefinitionsResult.data

            if (existingContractDefinitions.length > 0) {
                // as I might have different contract definitions with same code.. I will for the moment use the first one.
                const firstContractDefinition: ContractDefinition = existingContractDefinitions[0]
                const newContract: Contract = {
                    name: firstContractDefinition ? firstContractDefinition.name : "--",
                    sourceCode: firstContractDefinition ? firstContractDefinition.sourceCode : "--",
                    abi: firstContractDefinition ? firstContractDefinition.abi : [],
                    bytecode: firstContractDefinition ? firstContractDefinition.bytecode : "",
                    address: item.contractAddress || '',
                    runtimeBycode: runtimeByteCode,
                    connectionId: this.connection.id || 0,
                    creationDate: new Date().toLocaleDateString(),
                    lastExecutionDate: new Date().toLocaleDateString(),
                    transactionCount: transactionCount
                }
                result.push(newContract)
            }
        })
        return result;
    }

    getTransactions(block: Block) { // TODO: Add Retry in case something fails...
        console.log("Calling getTransactions", Date.now() - this.startTime)
        const promises = block.transactions.map((item) => {
            return this.rateLimitedGetTransaction(item)
        })
        console.log('getTransactions PROMISES', promises)
        return Promise.all(promises)
    }

    getTransactionReceipts(block: Block) {
        console.log("Calling getTransactionReceipts", Date.now() - this.startTime)
        const promises = block.transactions.map((item) => {
            return this.rateLimitedGetTransactionReceipt(item)
        })
        console.log('getTransactionReceipts PROMISES', promises)
        return Promise.all(promises)
        // const result = Promise.all(promises)
        // filter empty receipts.. add a try catch...
        // 
    }

    getBlockNumber() {
        console.log("Calling getBlockNumber", Date.now() - this.startTime)
        return Promise.resolve(2);
    }

    getBlock(blockNumber: number) {
        console.log(`Calling getBlock ${blockNumber}`, Date.now() - this.startTime)
        return Promise.resolve(buildFakeBlock())
    }

    getTransaction() {
        console.log("Calling getTransaction", Date.now() - this.startTime)
        return Promise.resolve(buildFakeTransaction())
    }

    getTransactionReceipt() {
        console.log("Calling getTransactionReceipt", Date.now() - this.startTime)
        return Promise.resolve(buildFakeTransactionReceipt())
    }

    getTransactionCount() {
        console.log("Calling getTransactionCount", Date.now() - this.startTime)
        return Promise.resolve(2);
    }

    getCode() {
        console.log("Calling getCode", Date.now() - this.startTime)
        return Promise.resolve("pragma solidity 0.4.12;..");
    }

    private sequenceBetween(start: number, end: number): number[] {
        return Array(end - start + 1)
            .fill(Number)
            .map((_, idx) => start + idx)
    }
}