import { useEffect, useState } from 'react'
import New from './New'
import OpenWallet from './OpenWallet'
import { ethAPI } from "../../scripts"

const InAppWallet = ({ setIsOpen, setAddress, setMainETHAddress, setTxs }) => {
  const [walletState, setWalletState] = useState({ useLocal: false, generating: false, saving: false, opening: false })
  const [wallet, setWallet] = useState({})
  const [toOpen, setOpeningWallet] = useState({})
  const [savedWallets, setSavedWallets] = useState([])

  useEffect(() => {
    const loaded = window.localStorage.getItem('gaslessWallets')
    setSavedWallets(JSON.parse(loaded))
  }, [])

  const openOne = ({ name, encrypted }) => {
    setOpeningWallet({ name, encrypted })
    setWalletState(prevState => {
      return {...prevState, opening: true, useLocal: true }
    })
  }

  const getSavedWallets = () => {
    if(savedWallets) {
      return savedWallets.map(w => {
        return <button key={w.walletName} onClick={() => {openOne({ name: w.walletName, encrypted: w.result })}} className="bg-gray-700 text-white p-3 px-5 mb-2 rounded text-sm">{w.walletName}</button>
      })
    } else {
      return <p className="text-gray-500 italic">(no saved wallets found)</p>
    }
  }

  const connectBrowser =() => {
    handleConnectToWallet({ setAddress, setMainETHAddress, setTxs, setIsOpen })
    setIsOpen(false)
  }

  return (
    <div className="text-center">
      {
        walletState.useLocal && walletState.generating && <New 
          wallet={wallet} 
          ethAPI={ethAPI} 
          setWalletState={setWalletState} 
          setOpeningWallet={setOpeningWallet}
          setSavedWallets={setSavedWallets}
          />
        }
      {
        walletState.useLocal && walletState.opening && !walletState.generating && <OpenWallet 
          ethAPI={ethAPI}
          toOpen={toOpen}
          setIsOpen={setIsOpen}
          setAddress={setAddress}
          setMainETHAddress={setMainETHAddress}
          setTxs={setTxs}
          setWalletState={setWalletState}
        />
      }
      {
        !walletState.generating && !walletState.opening && <>
          <div className="border border-gray-700 mb-2 pb-3 rounded">
            <p className="text-sm p-3">Load Existing</p>
            <div className="flex justify-around flex-wrap">
            {
              getSavedWallets()  
            }
            </div>
          </div>
          <button onClick={() => ethAPI.generateWallet({ setWalletState, method: 'generating', cb: setWallet})} className="bg-gray-700 text-white p-3 mb-2 rounded text-sm">Create New</button>
          <button onClick={connectBrowser} className="bg-gray-700 text-white p-3 rounded text-sm">Connect Browser Wallet (Metamask etc)</button>
        </>
      }
    </div>
  )
}


import { GetStaticProps } from 'next'
import { handleConnectToWallet } from '../../handlers'

export default InAppWallet
