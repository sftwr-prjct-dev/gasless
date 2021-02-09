import { useEffect, useState } from 'react'
import New from './New'
import OpenWallet from './OpenWallet'
import { ethAPI } from "../../scripts"

const InAppWallet = () => {
  const [walletState, setWalletState] = useState({ useLocal: false, generating: false, saving: false, opening: false })
  const [wallet, setWallet] = useState({})
  const [toOpen, setOpeningWallet] = useState('')
  const [savedWallets, setSavedWallets] = useState([])

  useEffect(() => {
    (async () => {
      const loaded = window.localStorage.getItem('gaslessWallets')
      setSavedWallets(JSON.parse(loaded))
      console.log(savedWallets)
    })()
    // setTimeout(() => {
    // }, 2000)
  }, [])

  const openOne = ({ encrypted }) => {
    setOpeningWallet(JSON.stringify(encrypted))
    setWalletState(prevState => {
      return {...prevState, opening: true }
    })
  }

  const getSavedWallets = () => {
    if(!savedWallets) {
      return <p className="text-gray-500 italic">(no saved wallets found)</p>
    } else {
      return savedWallets.map(w => {
        <button key={w.walletName} onClick={() => {openOne({ encrypted: w.result })}} className="bg-gray-700 text-white p-3 mb-2 rounded text-sm">{w.walletName}</button>
      })
    }
  }

  return (
    <div className="text-center">
      {
        walletState.useLocal && walletState.generating && <New wallet={wallet} ethAPI={ethAPI} setWalletState={setWalletState} setOpeningWallet={setOpeningWallet}/>
      }
      {
        walletState.useLocal && (walletState.opening || walletState.opening) && <OpenWallet ethAPI={ethAPI} toOpen={toOpen} />
      }
      {
        <>
          <div className="border border-gray-700 mb-2 pb-3 rounded">
            <p className="text-sm p-3">Load Existing</p>
            <div className="flex justify-around flex-wrap">
            {
              getSavedWallets()  
            }
            <button onClick={() => {openOne({ encrypted: 'j' })}} className="bg-gray-700 text-white p-3 mb-2 rounded text-sm">g</button>
            </div>
          </div>
          <button onClick={() => ethAPI.generateWallet({ setWalletState, method: 'generating', cb: setWallet})} className="bg-gray-700 text-white p-3 mb-2 rounded text-sm">Create New</button>
          <button className="bg-gray-700 text-white p-3 rounded text-sm">Connect Browser Wallet (Metamask etc)</button>
        </>
      }
    </div>
  )
}

export default InAppWallet

