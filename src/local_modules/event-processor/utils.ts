export const getSampleBlockTransactions = (numberOfTransactions: number) => {
  const transactionHashes = Array<string>(numberOfTransactions)
    .fill('')
    .map((_, index) => {
      return `hash${index}`
    })
  console.log('transactionHashes', transactionHashes)
  const block = {
    transactions: transactionHashes
  }
  return block
}

export const getSampleTransactionReceipt = (eventsPerTransaction: number) => {
  const logs = Array(eventsPerTransaction)
    .fill('')
    .map((_, index) => {
      return { topics: [`0xtopic${index}`] }
    })
  const transactionReceipt = {
    logs
  }
  return transactionReceipt
}
