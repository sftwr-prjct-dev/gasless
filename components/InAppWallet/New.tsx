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

  return(
    <div className="text-center">
      
      <div>
        <label htmlFor="wallet-name" className="text-sm">Wallet Name</label>
        <input onChange={(e) => createWalletMethod({ e, cb: setWalletName })} placeholder="wallet name" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
      </div>
      
      <p className="text-sm">Passphrase</p>
      <div className="flex justify-center flex-wrap p4 border border-gray-700 rounded py-2">
        {
          walletPhrase.map(( phrase: string, index: number) => {
            return(
              <span key={phrase} className="p-2 m-1 bg-gray-600 text-white text-sm rounded-md">{`${index + 1}. ${phrase}`}</span>
            )
          })
        }
      </div>
      <div>
        <div className="text-left">
          <label htmlFor="wallet-password" className="text-sm">Enter a password</label>
          <input type="password" onChange={(e) => createWalletMethod({ e, cb: setPassPhrase })} placeholder="wallet password" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
        </div><div className="text-left">
          <label htmlFor="wallet-password" className="text-sm">Enter password again</label>
          <input type="password" onChange={(e) => createWalletMethod({ e, cb: setConfirmPassPhrase })} placeholder="wallet password" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
        </div>
      </div>
      <div className="m-2">
        <input onChange={(e) => createWalletMethod({ e, cb: setSavedPhrase })} type="radio" />
        <small className="ml-1">I have saved the wallet</small>
      </div>
      <div className="m-2">
        <button className="bg-gray-600 text-white text-sm p-2 rounded-md" onClick={createWallet}>Create Wallet</button>
      </div>
      {
        errorMessage && <p className="text-red-600 text-xs">{errorMessage}</p>
      }      
    </div>
  )
}

export default NewWallet