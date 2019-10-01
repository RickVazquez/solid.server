import AsyncPolling from 'async-polling'

import { Connection, buildFakeConnection, buildFakeBlock, buildFakeBlocks, buildFakeTransactions } from '@solidstudio/solid.types'

import app from '../../../src/app';

import { BlockchainSynchronizer } from '../../../src/local_modules/event-processor/BlockchainSynchronizer'
import { PollingService } from '../../../src/local_modules/event-processor/PollingService';

describe('BlockchainSynchronizer tests', () => {

    let blockchainSynchronizer: BlockchainSynchronizer
    let sampleConnection: Connection
    let pollingFactory: PollingService

    it.skip('should help me create a strong poller mechanism with transaction guarantee', async () => {
        sampleConnection = buildFakeConnection()
        pollingFactory = new PollingService()
        blockchainSynchronizer = new BlockchainSynchronizer(sampleConnection, pollingFactory, app)

        blockchainSynchronizer.start()
    })

    it.only('should make a transaction', async (done) => {
        const block = buildFakeBlock()
        block.transactions = JSON.stringify(block.transactions) as any
        block.uncles = JSON.stringify(block.uncles) as any

        const transactions = buildFakeTransactions()

        const sequelize = app.get('sequelizeClient');
        const transactionsService = app.service('transactions')
        const blocksService = app.service('blocks')

        sequelize.transaction(transaction => {
            return blocksService.create(block, { sequelize: { transaction } })
                .then((whatIsThis) => {
                    console.log("whatIsThis", whatIsThis)
                    return transactionsService.create(transactions, { sequelize: { transaction } })
                })
        }).then(result => {
            // Transaction has been committed
            // result is whatever the result of the promise chain returned to the transaction callback
            console.log("RESULT", result)
            done()
        }).catch(err => {
            // Transaction has been rolled back
            // err is whatever rejected the promise chain returned to the transaction callback
            console.log("error", err)
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

    it.skip('should help me understand the behaviour of AsyncPolling', (done) => {

        let counter = 0;
        // it should call synchronize after 5 ms?
        const startTime = Date.now()
        console.log("Start time", 0)
        console.time('Synchronizer')

        const otherFunction = () => {
            return new Promise((resolve, reject) => {
                console.log("I'm inside another function", Date.now() - startTime)
                setTimeout(() => {
                    console.log("I'm inside resolved", Date.now() - startTime)
                    resolve(true)
                }, 3000);
            })
        }

        AsyncPolling((end) => {
            // Do whatever you want.
            // console.timeLog('synchronizer');
            otherFunction()
                .then(() => {
                    console.log("Synchronized Before END", Date.now() - startTime);
                    end();
                    console.log("Synchronized After END", Date.now() - startTime);
                    counter++
                })
            if (counter >= 5) {
                done()
                console.timeEnd('Synchronizer');
            }
        }, 100).run(); // este valor es dependiendo el block period y ya, lo demas recursivo hasta que se sincronize...
    })
})