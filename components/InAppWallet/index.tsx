import { useEffect, useState } from 'react'
import New from './New'
import OpenWallet from './OpenWallet'
import { ethAPI } from "../../scripts"
import { handleConnectToWallet } from '../../handlers'


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
      return (
        <div className="grid-cols-3 grid gap-2 p-2 overflow-y-scroll h-full w-full">
          {savedWallets.map(w => {
        return <button key={w.walletName} onClick={() => {openOne({ name: w.walletName, encrypted: w.result })}} className="bg-white text-dirt-white h-10 opacity-75 rounded text-sm">{w.walletName}</button>
      })}
        </div>
      )
    } else {
      return <p className="text-white italic">(no saved wallets found)</p>
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
        !walletState.generating && !walletState.opening &&
        <div className="h-350 flex flex-col justify-between">
          <div className="h-3/10 flex items-center justify-center bg-blue-500 border border-blue-400 rounded">
            {
              getSavedWallets()  
            }
          </div>
          <button onClick={() => ethAPI.generateWallet({ setWalletState, method: 'generating', cb: setWallet})} className="text-white h-3/10 w-full bg-purple-500 rounded">Create New</button>
          <button onClick={connectBrowser} className="bg-green-600 text-white w-full h-3/10 rounded">Connect Browser Wallet</button>
        </div>
      }
    </div>
  )
}

export default InAppWallet
