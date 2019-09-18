import { getSampleBlockTransactions, getSampleTransactionReceipt } from './utils'

describe('utils test', () => {
  describe('getBlockTransactions', () => {
    it('should get transactions per block', () => {
      const result = getSampleBlockTransactions(2)

      expect(result.transactions).toHaveLength(2)
    })
  })

  describe('getTransactionReceipt', () => {
    it('should get a transaction receipt', () => {
      const result = getSampleTransactionReceipt(2)

      expect(result.logs).toHaveLength(2)
    })
  })
})
