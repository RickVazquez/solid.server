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
import { Transactions } from '../../services/transactions/transactions.class'
import { Connections } from '../../services/connections/connections.class'
import { Contracts } from '../../services/contracts/contracts.class'
import { Blocks } from '../../services/blocks/blocks.class'

import { IPollingService } from './IPollingService'
import { IBlockchainProcessor } from './IBlockchainProcessor'

export class BlockchainSynchronizer implements IBlockchainProcessor {

    asyncPolling: IBlockchainProcessor // ?
    // web3Wrapper: IWeb3Wrapper
    connection: Connection
    startTime: number
    // connectionService: Connections
    transactionsService: Transactions
    // contractDefinitionsService: ContractDefinitions
    // contractsService: Contracts
    blocksService: Blocks
    // I receive a connection and I return an object of 
    // block information that can be pushed to a database
    // no, I'm the one pushing to the database...
    // I need to call someone to give me all information...

    // getBlock [1] // rate limiter (1 of 5)
    // getTransactions(block) (x of 5 - 1)
    // getTransactionReceipts(block) (x of 5 - 1)
    private readonly rateLimitedGetTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
    private readonly rateLimitedGetTransaction: (txHash: string) => Promise<Transaction>
    private readonly rateLimitedGetBlock: (blockNumber: number) => Promise<Block>
    private readonly rateLimitedGetBlockNumber: () => Promise<number>
    private readonly limiter: Bottleneck
    private readonly sequelize: Sequelize;

    constructor(connection: Connection, pollingServiceFactory: IPollingService, app: Application) {//, web3Wrapper: IWeb3Wrapper) {
        // this.connectionService = app.service('connections')
        this.transactionsService = app.service('transactions')
        this.blocksService = app.service('blocks')
        // this.contractDefinitionsService = app.service('contract-definitions')
        // this.contractsService = app.service('contracts')
        this.limiter = new Bottleneck({
            maxConcurrent: 1,
            minTime: 210
        })

        this.sequelize = app.get('sequelizeClient');
        this.connection = connection
        this.startTime = Date.now()
        // this.web3Wrapper = web3Wrapper

        this.rateLimitedGetTransaction = this.limiter.wrap(this.getTransaction.bind(this))
        this.rateLimitedGetTransactionReceipt = this.limiter.wrap(this.getTransactionReceipt.bind(this))
        this.rateLimitedGetBlockNumber = this.limiter.wrap(this.getBlockNumber.bind(this)) // TODO: to change by real web3 wrapper
        this.rateLimitedGetBlock = this.limiter.wrap(this.getBlock.bind(this))

        this.asyncPolling = pollingServiceFactory.createPolling(async (end) => {
            await this.synchronize()
            end()
        }, 1000) // TODO: this.connection.blockPeriodTime, 
    }

    async start() {
        this.asyncPolling.start()
    }

    async stop() {
        this.asyncPolling.stop()
    }

    async synchronize() {
        const blockNumber = await this.rateLimitedGetBlockNumber()
        const lastProcessedBlockNumber = this.connection.lastBlockNumberProcessed || 0 // TODO: Remove this for a value coming from connection service..
        // this.connection.lastTransaction...... TODO: remove lastTransctionProcessed...
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

            // if las transactionReceipt tienen contractAddress...
            // hacer este proceso para guardar contracts...
            // if las transactionReceipt tienen un to, de un contrato
            // que yo tengo guardado en Contracts...
            // entonces debo guardar esos?
            // debe de haber un proceso que agarre las contract creation
            // y esa address entonces guardar en una estructura que contenga
            // todas las transacciones de un contrato...
            // Creo que seria un query nadamas...
            // SELECT * FROM TRANSACTION_RECEIPTS
            // WHERE CONTRACT ADDRESS = CONTRACT SELECTED...
            // Y WHERE TO = CONTRACT SELECTED...
            // ORDENAR y COMPUTAR EL STATE...
            // otra es, las que son contract creation
            // guardar en CONTRACT_HISTORY
            // las que no, las que tienen TO, agarrar el TO, e insertar
            // en CONTRACT HISTORY?.. Cual es el beneficio??
            // Puedo pensar en un caching mechanism..

            // const runtimeByteCode = await this.web3Wrapper.getCode(receipt.contractAddress)
            // const transactionCount = await this.web3Wrapper.getTransactionCount(receipt.contractAddress)

            // console.log("runtimeByteCode from web3", runtimeByteCode)
            // const contractDefinitionsResult = await this.contractDefinitionsService.find()
            // const allExistingRuntimeBytecode = contractDefinitionsResult.data

            // const itemFound = allExistingRuntimeBytecode.find((element: ContractDefinition) => {
            //   console.log("allExistingRuntimeBytecode find element", element.runtimeBycode)
            //   return element.runtimeBycode === runtimeByteCode
            // });

            // const newContract: Contract = {
            //   name: itemFound ? itemFound.name : "--",
            //   sourceCode: itemFound ? itemFound.sourceCode : "--",
            //   abi: itemFound ? itemFound.abi : [],
            //   bytecode: itemFound ? itemFound.bytecode : "",
            //   address: receipt.contractAddress,
            //   connectionId: this.connection.id || 0,
            //   creationDate: new Date().toLocaleDateString(),
            //   lastExecutionDate: new Date().toLocaleDateString(),
            //   transactionCount: transactionCount
            // }

            console.log("Block", block)
            console.log("TransactionReceipts", transactionReceipts)
            console.log("Transactions", transactions)
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
                // chain all your queries here. make sure you return them.
                //return Block.create(block, { transaction: t })
                //     .then(block => {
                //         return tran.setShooter({
                //             firstName: 'John',
                //             lastName: 'Boothe'
                //         }, { transaction: t });
                //     });
                return this.blocksService.create(block, { sequelize: { transaction } })
                    .then((whatIsThis) => {
                        console.log("whatIsThis", whatIsThis)
                        return this.transactionsService.create(transactions, { sequelize: { transaction } })
                    })
            }).then(result => {
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
            }).catch(err => {
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
            });
        }


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

    private sequenceBetween(start: number, end: number): number[] {
        return Array(end - start + 1)
            .fill(Number)
            .map((_, idx) => start + idx)
    }
}