import AsyncPolling from 'async-polling'
import { Connection, buildFakeConnection, buildFakeBlock, buildFakeBlocks, buildFakeTransactions, buildFakeTransaction, buildFakeTransactionReceipt } from '@solidstudio/solid.types'
import { BlockchainSynchronizer } from '../../../src/local_modules/event-processor/BlockchainSynchronizer'
import { PollingService } from '../../../src/local_modules/event-processor/PollingService';
import { IWeb3Wrapper } from '../../../src/local_modules/web3-wrapper/IWeb3Wrapper'
import { Web3Wrapper } from '../../../src/local_modules/web3-wrapper/Web3Wrapper'
import { randomHex } from 'web3-utils'

import app from '../../../src/app';

jest.mock('../../../src/local_modules/web3-wrapper/Web3Wrapper')

const delay = (ms: number) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}


jest.setTimeout(10000000)

describe('BlockchainSynchronizer tests', () => {

    // TODO: Get code.
    beforeAll(async () => {
        const startTime: number = Date.now()

        const sequelise = app.get('sequelizeClient')

        await sequelise.sync({ force: true });

        (Web3Wrapper as any).mockImplementation(() => {
            return {
                getBlockNumber: () => {
                    console.log("Calling getBlockNumber", Date.now() - startTime)
                    return Promise.resolve(2);
                },
                getBlock: (blockNumber: number) => {
                    console.log(`Calling getBlock ${blockNumber}`, Date.now() - startTime)
                    return Promise.resolve(buildFakeBlock({
                        blockNumber,
                        transactions: [randomHex(32), randomHex(32)]
                    }))
                },
                getTransaction: (txHash: string) => {
                    console.log("Calling getTransaction", Date.now() - startTime)
                    return Promise.resolve(buildFakeTransaction({
                        hash: txHash
                    }))
                },
                getTransactionReceipt: (txHash: string) => {
                    console.log("Calling getTransactionReceipt", Date.now() - startTime)
                    return Promise.resolve(buildFakeTransactionReceipt({
                        transactionHash: txHash
                    }))
                },
                getTransactionCount: (contractAddress: string) => {
                    console.log("Calling getTransactionCount", Date.now() - startTime)
                    return Promise.resolve(1);
                },
                getCode: (contractAddress: string) => {
                    console.log("Calling getCode", Date.now() - startTime)
                    return Promise.resolve("pragma solidity 0.4.12;..");
                },
                getDefaultAccount: jest.fn()
            };
        });
    })

    it.only('should process a block', async () => {
        const sampleConnection = buildFakeConnection({
            name: "TESTxx2"
        })

        delete sampleConnection.id;

        const connectionsService = app.service('connections')
        const blocksService = app.service('blocks')
        const transactionsService = app.service('transactions')
        const transactionReceiptsService = app.service('transaction-receipts')

        const newConnection = await connectionsService.create(sampleConnection);

        expect(newConnection).toBeDefined()
        expect(newConnection.id).toBeGreaterThan(0)
        expect(newConnection.lastBlockNumberProcessed).toEqual(0)

        await delay(10000)

        const connectionAfterDelay = await connectionsService.get(newConnection.id)

        expect(connectionAfterDelay.lastBlockNumberProcessed).toEqual(2)

        // blocks
        const totalBlocks = await blocksService.find()

        expect(totalBlocks).toBeDefined()
        expect(totalBlocks.data).toHaveLength(2)

        // transactions
        const totalTransactions = await transactionsService.find()

        expect(totalTransactions).toBeDefined()
        expect(totalTransactions.data).toHaveLength(4)

        // transactionReceipts
        const transactionReceipts = await transactionReceiptsService.find()

        expect(transactionReceipts).toBeDefined()
        expect(transactionReceipts.data).toHaveLength(4)

        await connectionsService.remove(newConnection.id)

        await delay(10000)

        expect((await connectionsService.find()).data).toHaveLength(0)
        expect((await blocksService.find()).data).toHaveLength(0)
        expect((await transactionsService.find()).data).toHaveLength(0)
        expect((await transactionReceiptsService.find()).data).toHaveLength(0)
    })

    it.skip('should help me to understand how to make a transaction', async (done) => {
        const sampleConnection = buildFakeConnection({
            name: "TESTxx2"
        })

        delete sampleConnection.id;

        const sequelize = app.get('sequelizeClient');
        const transactionsService = app.service('transactions')
        const blocksService = app.service('blocks')
        const connectionsService = app.service('connections')
        const newConnection = await connectionsService.create(sampleConnection);

        console.log("newConnection", newConnection)
        const block = buildFakeBlock({
            connectionId: newConnection.id
        })

        const transactionValue = buildFakeTransaction({
            connectionId: newConnection.id
        })

        sequelize.transaction(async (transaction) => {
            await blocksService.create(block, { sequelize: { transaction } })
            await transactionsService.create(transactionValue, { sequelize: { transaction } })
            // throw new Error('something wrong')
            return await connectionsService.update(newConnection.id, {
                ...newConnection,
                lastBlockNumberProcessed: 10
            }, { sequelize: { transaction } })
        }).then(async (result) => {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            console.log("TRANSACTION COMPLETE, RESULT", result)
            console.log("ABOUT TO REMOVE CONNECTION")
            await connectionsService.remove(newConnection.id)
            done()
        }).catch(err => {
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
            console.log("TRANSACTION FAILED, error", err)
            done()
        });
    })

    it.skip('should create an array of promises', async () => {
        const getTransactionReceipt = (txHash: string) => {
            return Promise.resolve('1')
        }

        const block = buildFakeBlock()
        const promises = block.transactions.map((item) => {
            return getTransactionReceipt(item)
        })
        console.log('PROMISES', promises)

        const result = await Promise.all(promises)

        console.log('RESULT', result)
    })

    it.skip('should help me understand the behaviour of AsyncPolling', async (done) => {

        let counter = 0;
        // it should call synchronize after 5 ms?
        const startTime = Date.now()
        console.log("Start time", 0)
        console.time('Synchronizer')

        const otherFunction = () => {
            return new Promise((resolve, reject) => {
                console.log("I'm inside another function", Date.now() - startTime, counter)
                setTimeout(() => {
                    console.log("I'm inside resolved", Date.now() - startTime)
                    resolve(true)
                }, 3000);
            })
        }

        const asyncPolling = AsyncPolling((end) => {
            // Do whatever you want.
            // console.timeLog('synchronizer');
            otherFunction()
                .then(() => {
                    console.log("Synchronized Before END", Date.now() - startTime);
                    end();
                    console.log("Synchronized After END", Date.now() - startTime);
                    counter++
                })
            if (counter >= 500) {
                done()
                console.timeEnd('Synchronizer');
            }
        }, 100)//.run(); // este valor es dependiendo el block period y ya, lo demas recursivo hasta que se sincronize...

        await asyncPolling.run()

        await delay(10000)

        console.log("ABOUT TO STOP")
        await asyncPolling.stop()
    })
})