
import { useState } from 'react'
const OpenWallet = ({ ethAPI, toOpen }) => {
  const [wallet, setWallet] = useState(null)
  
  const encrypted = JSON.parse(toOpen)

  const decryptWallet = async ({ e, cb}) => {
    if(e.key.toLowerCase() === 'enter') {
      const decrypted = await ethAPI.openLocalWallet({ encryptedWallet: encrypted.result, passphrase: e.target.value })
      console.log(decrypted)
    }
  }

  return(
    <div>
      <p>Opening {encrypted.walletName}</p>
      <div>
        <label htmlFor="wallet-passphrase" className="text-sm">Passphrase:</label>
        <input onKeyUp={(e) => decryptWallet({ e, cb: setWallet })} placeholder="wallet name" className="border border-gray-600 p-2 m-2 ml-0 mt-1 rounded"/>
      </div>
    </div>
  )
}

export default OpenWallet

