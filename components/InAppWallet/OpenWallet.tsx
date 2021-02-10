
import { useState } from 'react'
import { handleConnectToWallet } from '../../handlers'
const OpenWallet = ({ ethAPI, toOpen, setIsOpen, setTxs, setAddress, setMainETHAddress, setWalletState }) => {
  console.log(toOpen)
  const [wallet, setWallet] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCustom, setIsCustom] = useState(false)
  const [stage, setStage] = useState(1)
  const [network, setNetwork] = useState({ network: 'kovan', customEndpoint: '' })
  
  const decryptWallet = async ({ e, cb}) => {
    e.preventDefault()
    setErrorMessage('')
    if(e.target.password.value.length > 0) {
      setLoading(true)
      try {
        const decrypted = await ethAPI.decryptLocalWallet({ encryptedWallet: toOpen.encrypted, passphrase: e.target.password.value })
        setErrorMessage('')
        setLoading(true)
        // cb(`${decrypted.mnemonic.phrase}`)
        cb(decrypted.mnemonic.phrase)
        setLoading(false)
        setStage(2)
      } catch(e) {
        setErrorMessage('Invalid Password Error')
        setLoading(false)
      } 
    } else {
      setErrorMessage('Invalid Password Error')
      setTimeout(() => {
        setErrorMessage('')
      }, 1000)
    }
    return true
  }

  const selectNetwork = (e) => {
    if(e.target.value === 'custom') {
      setIsCustom(true)
    } else {
      setIsCustom(false)
    }
    setNetwork({ customEndpoint: '', network: e.target.value})
  }

  const setCustomNetwork = (e) => {
    setNetwork(prev => {
      return {...prev, customEndpoint: e.target.value }
    })
  }

  const loadNetwork = async () => {
    handleConnectToWallet(
      { 
        wallet,
        network: network.network, 
        customEndpoint: network.customEndpoint, 
        setTxs, 
        setIsOpen, 
        setAddress, 
        setMainETHAddress 
      })
      setIsOpen(false)
  }

  return(
    <div>
      <p className="text-sm">Opening Wallet "{toOpen.name}"</p>
      {
        loading && <p className="text-green-600 italic text-xs">Fetching wallet...</p>
      }
      {
        errorMessage && <p className="text-red-600 text-xs">{errorMessage}</p>
      }
      <div>
        { stage === 1 && 
          <form onSubmit={(e) => decryptWallet({ e, cb: setWallet })}>
            <label htmlFor="wallet-passphrase" className="text-xs text-left">Passphrase:</label>
            <input type="password" name="password" disabled={loading} placeholder="wallet passphrase" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
            <div className="flex justify-center">
              <button onClick={() => setWalletState({ generating: false, opening: false })} className="border border-gray-500 hover:border-gray-600 hover:text-gray-600 py-2 px-3 m-2 mt-0 text-gray-500 rounded-md">Cancel</button>
              <button disabled={loading} type="submit" className="bg-gray-600 py-2 px-3 m-2 mt-0 text-white rounded-md">Next</button>
            </div>        
          </form>
        }
        {
          
          stage === 2 &&
          <div className="m-1">
            <select onChange={selectNetwork} defaultValue="kovan" className="border p-2">
              <option value="kovan" className="p-2 hover:bg-gray-600 hover:text-white">Ethereum (Kovan)</option>
              <option value="custom" className="p-2 hover:bg-gray-600 hover:text-white italic">Custom...</option>
            </select>
            {
              isCustom &&
              <div className="m-1">
                <label htmlFor="wallet-passphrase" className="text-xs text-left">Custom Node Endpoint:</label>
                <input onChange={setCustomNetwork} placeholder="custom node url" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
              </div>
            }
            <div className="m-2">
              <button onClick={() => setStage(stage-1)} className="border border-gray-500 hover:border-gray-600 hover:text-gray-600 py-2 px-3 m-2 mt-0 text-gray-500 rounded-md">Back</button>
              <button onClick={loadNetwork} type="submit" className="bg-gray-600 py-2 px-3 m-2 mt-0 text-white rounded-md">Continue</button>
            </div>
          </div>
        }
        <div className="mt-1 flex justify-around">
          <div className="flex items-center text-xs justify-center italic text-green-500 p-1">decrypt</div>
          <div className="flex items-center text-xs justify-center italic text-green-500 p-1">finish</div>
        </div>
        <div className="mt-0 flex justify-around">
          <div className={`${stage === 1 ? 'text-white bg-gray-600' : null} flex items-center text-xs justify-center border-2 p-1 h-6 w-6 rounded-full`}>1</div>
          <div className={`${stage === 2 ? 'text-white bg-gray-600' : null} flex items-center text-xs justify-center border-2 p-1 h-6 w-6 rounded-full`}>2</div>
        </div>
      </div>
    </div>
  )
}

export default OpenWallet

