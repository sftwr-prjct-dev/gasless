import { useState } from 'react'

const NewWallet = ({ wallet, ethAPI, setWalletState, setOpeningWallet, setSavedWallets }) => {
  const walletPhrase = wallet.phrase.split(" ")
  const [savedPhrase, setSavedPhrase] = useState('off')
  const [passphrase, setPassPhrase] = useState('')
  const [confirmPassphrase, setConfirmPassPhrase] = useState('')
  const [walletName, setWalletName] = useState('')
  const [errorMessage, setError] = useState('')

  const createWalletMethod = ({ e, cb }) => {
    cb(e.target.value)
    if(cb === setConfirmPassPhrase) {
      if(passphrase !== e.target.value) {
        setError('Passphrase must be the same')
      } else {
        setError('')
      }
    }
  }

  const createWallet = async () => {
    if (walletName === '') {
      setError('You must provide a name for the wallet')
    } else if (savedPhrase === 'off') {
      setError('You must accept that you have saved the phrase elsewhere')
    } else if(passphrase !== confirmPassphrase){
      setError('Passphrase must be the same')
    } else {
      setError('')
      let savedWallets
      let result = await ethAPI.createWallet({ phrase: wallet.phrase, passphrase })
      result = { walletName, result }
      const gaslessWallets = window.localStorage.getItem('gaslessWallets')
      if(!gaslessWallets) {
        savedWallets = JSON.stringify([result])
        window.localStorage.setItem('gaslessWallets', savedWallets)
        
      } else {
        savedWallets = JSON.parse(gaslessWallets)
        savedWallets.push(result)
        savedWallets = JSON.stringify(savedWallets)
        window.localStorage.setItem('gaslessWallets', savedWallets)
      }
      setWalletState(prevState => {
        return {...prevState, generating: false, opening: true }
      })
      setSavedWallets(JSON.parse(savedWallets))
      setOpeningWallet({ name: walletName, encrypted: result.result })
    }
  }

  const labelClass = "text-sm inline-block w-full text-left opacity-50"
  const labelClassM = "text-sm inline-block w-full text-left opacity-50 mt-3"
  const inputClass = "border-none outline-none focus:outline-none w-full h-10 pl-2 mt-1 text-dirt-white rounded"

  return(
    <>
      <label htmlFor="wallet-name" className={`${labelClass}`}>Wallet Name</label>
      <input onChange={(e) => createWalletMethod({ e, cb: setWalletName })} placeholder="wallet name" className={inputClass}/>
      
      <p className={`${labelClassM}`}>Passphrase</p>
      <div className=" grid grid-cols-3 md:grid-cols-4 gap-1 rounded">
        {
          walletPhrase.map(( phrase: string, index: number) => {
            return(
              <span key={phrase} className="border border-gray-600 h-10 flex justify-center opacity-75 items-center text-white text-sm rounded">{`${index + 1}. ${phrase}`}</span>
            )
          })
        }
      </div>
      <div>
        <div className="text-left">
          <label htmlFor="wallet-password" className={`${labelClassM}`}>Enter a password</label>
          <input type="password" onChange={(e) => createWalletMethod({ e, cb: setPassPhrase })} placeholder="wallet password" className={inputClass}/>
        </div><div className="text-left">
          <label htmlFor="wallet-password" className={`${labelClassM}`}>Enter password again</label>
          <input type="password" onChange={(e) => createWalletMethod({ e, cb: setConfirmPassPhrase })} placeholder="wallet password" className={inputClass}/>
        </div>
      </div>
      <div className="mt-4 w-full flex items-center">
        <input onChange={(e) => createWalletMethod({ e, cb: setSavedPhrase })} type="radio" />
        <small className="ml-1">I have saved the wallet passphrase</small>
      </div>
      <div className="mt-1">
        {
          errorMessage && <p className="text-red-600 text-xs">{errorMessage}</p>
        }
        <button className="bg-gray-600 w-full mt-1 h-12 text-white rounded-md" onClick={createWallet}>Create Wallet</button>
      </div>
            
    </>
  )
}

export default NewWallet