import Bottleneck from 'bottleneck'
import { Sequelize } from 'sequelize';

import { Connection, Transaction, ContractDefinition, Contract, TransactionReceipt, Block, buildFakeBlock, buildFakeTransactionReceipt, buildFakeTransaction, buildFakeTransactions, buildFakeTransactionReceipts } from '@solidstudio/solid.types'

import { Application } from '../../declarations'
import { IWeb3Wrapper } from '../web3-wrapper/IWeb3Wrapper'
import { Web3Wrapper } from '../web3-wrapper/Web3Wrapper'

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
    private readonly limiter: Bottleneck
    private readonly sequelize: Sequelize;

    // services
    private readonly connectionService: Connections
    private readonly transactionsService: Transactions
    private readonly contractDefinitionsService: ContractDefinitions
    private readonly contractsService: Contracts
    private readonly blocksService: Blocks
    private readonly transactionReceiptsService: TransactionReceipts

    // web3 wrapper methods
    private readonly rateLimitedGetTransactionReceipt: (txHash: string) => Promise<TransactionReceipt>
    private readonly rateLimitedGetTransaction: (txHash: string) => Promise<Transaction>
    private readonly rateLimitedGetBlock: (blockNumber: number) => Promise<Block>
    private readonly rateLimitedGetBlockNumber: () => Promise<number>
    private readonly rateLimitedGetTransactionCount: (contractAddress: string) => Promise<number>
    private readonly rateLimitedGetCode: (contractAddress: string) => Promise<string>

    constructor(connection: Connection, pollingServiceFactory: IPollingService, app: Application) {
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

        this.web3Wrapper = new Web3Wrapper(this.connection.url)
        this.rateLimitedGetTransaction = this.limiter.wrap(this.web3Wrapper.getTransaction.bind(this))
        this.rateLimitedGetTransactionReceipt = this.limiter.wrap(this.web3Wrapper.getTransactionReceipt.bind(this))
        this.rateLimitedGetBlockNumber = this.limiter.wrap(this.web3Wrapper.getBlockNumber.bind(this))
        this.rateLimitedGetBlock = this.limiter.wrap(this.web3Wrapper.getBlock.bind(this))
        this.rateLimitedGetTransactionCount = this.limiter.wrap(this.web3Wrapper.getTransactionCount.bind(this))
        this.rateLimitedGetCode = this.limiter.wrap(this.web3Wrapper.getCode.bind(this))

        this.asyncPolling = pollingServiceFactory.createPolling((end) => {
            this.synchronize()
                .then(() => {
                    end()
                })
        }, 1000) // TODO: this.connection.blockPeriodTime
    }

    async start() {
        console.log("Started Polling")
        await this.asyncPolling.start()
    }

    async stop() {
        await this.asyncPolling.stop()
        await this.limiter.stop();
        console.log("Shutdown completed!")
    }

    async synchronize() {
        console.log("Starting to Synchronize")
        const connectionId = this.connection.id || 0
        const connectionResult = await this.connectionService.get(connectionId)
        const connection: Connection = connectionResult;
        const lastProcessedBlockNumber = connection.lastBlockNumberProcessed || 0;
        const blockNumber = await this.rateLimitedGetBlockNumber()

        if (lastProcessedBlockNumber > blockNumber) {
            console.error('BlockNumberInconsistency: Last processed block in DB is higher than last block in the blockchain')
            console.log(`BlockNumberInconsistency BlockNumber: ${blockNumber}, lastProcessedBlockNumber: ${lastProcessedBlockNumber}`)
            return
        }

        if (lastProcessedBlockNumber === blockNumber) {
            console.log("NODE SYNCHRONIZED!!!")
            return
        }

        console.log(`BlockNumber: ${blockNumber}, lastProcessedBlockNumber: ${lastProcessedBlockNumber}`)

        const blocksSequence = this.sequenceBetween(lastProcessedBlockNumber + 1, blockNumber)
        console.log("BLOCK SEQUENCE", JSON.stringify(blocksSequence))
        for (const blockNumber of blocksSequence) {

            const block = await this.getBlock(blockNumber)
            if (!block) { // TODO: Analyse, Exit from loop?
                return;
            }
            const transactionReceipts = await this.getTransactionReceipts(block)
            const transactions = await this.getTransactions(block)
            // const contracts = await this.getContracts(transactionReceipts)

            console.log("Block", block)
            console.log("TransactionReceipts", transactionReceipts)
            console.log("Transactions", transactions)
            // console.log("Contracts", contracts)

            this.sequelize.transaction(async (transaction) => {
                await this.blocksService.create(block, { sequelize: { transaction } }) // Blocks
                await this.transactionsService.create(transactions, { sequelize: { transaction } }) // Transactions
                await this.transactionReceiptsService.create(transactionReceipts, { sequelize: { transaction } }) // Transaction Receipts
                // await this.contractsService.create(contracts, { sequelize: { transaction } }) // Contracts
                if (this.connection.id) {
                    return await this.connectionService.update(this.connection.id, {
                        ...connection,
                        lastBlockNumberProcessed: blockNumber
                    }, { sequelize: { transaction } })
                }
            }).then(result => {
                console.log("TRANSACTION SUCCESSFUL", result)
                // Transaction has been committed
                // result is whatever the result of the promise chain returned to the transaction callback
            }).catch(err => {
                console.log("TRANSACTION ERROR", err)
                // TODO RETRY
                // Transaction has been rolled back
                // err is whatever rejected the promise chain returned to the transaction callback
            });
        }
    }

    async getContracts(transactionReceipts: TransactionReceipt[]) {
        // TODO: Error handling and retry
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
                // TODO: as I might have different contract definitions with same code.. I will for the moment use the first one.
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

    async getBlock(blockNumber: number) {
        let result: Block | undefined = undefined;
        try {
            result = await this.rateLimitedGetBlock(blockNumber)
        } catch (error) {
            console.log("ERROR in getBlock", error.message)
        }
        return result;
    }

    async getTransactions(block: Block) {
        let result: Transaction[] = []
        try {
            console.log("Calling getTransactions")
            const promises = block.transactions.map((item) => {
                return this.rateLimitedGetTransaction(item)
            })
            result = await Promise.all(promises)
        } catch (error) {
            console.log("ERROR in getTransactions", error.message)
            // if error is because rateLimiter ERROR in getTransactions This limiter has been stopped and cannot accept new jobs.
            // TODO RETRY...
        }
        return result
    }

    async getTransactionReceipts(block: Block) {
        let result: TransactionReceipt[] = []
        try {
            console.log("Calling getTransactionReceipts")
            const promises = block.transactions.map((item) => {
                return this.rateLimitedGetTransactionReceipt(item)
            })
            // console.log('getTransactionReceipts PROMISES', promises)
            result = await Promise.all(promises)
        } catch (error) {
            console.log("ERROR in getTransactionReceipts", error.message)
            // TODO RETRY...
        }
        return result
    }

    private sequenceBetween(start: number, end: number): number[] {
        return Array(end - start + 1)
            .fill(Number)
            .map((_, idx) => start + idx)
    }
}