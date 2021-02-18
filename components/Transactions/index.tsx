import { getExplorerBase } from "../../scripts"

const Transactions = ({ txs }) => {
  let baseUrl = getExplorerBase(txs.chain, txs.chainID)


  const formatTxView = (str) => {
    return `${str.slice(0, 18)}.....${str.slice(50)}`
  }

  return(
    <div className="bg-dark-gray mt-4 p-2 pb-6 w-full rounded-md">
      <span className="text-dirt-white">Transactions</span>
      <div className="p-4 pb-0 h-64 md:h-32 overflow-y-scroll w-full">
      {
        txs && txs.txs ? txs.txs.map((tx: string) => {
          formatTxView(tx)
          return <div key={tx} className="underline text-dirt-white mb-4 cursor-pointer w-full">
            {
              txs.chain !== 'local' ? <a target="_blank" href={`https://${baseUrl}/tx/${tx}`}>{formatTxView(tx)}</a> : formatTxView(tx)
            }
        </div>
        }) : null
      }
      </div>
    </div>
  )
}

export default Transactions