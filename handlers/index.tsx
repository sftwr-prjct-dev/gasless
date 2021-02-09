import { ethAPI } from "../scripts"

export const zeroAddress = "0x0000000000000000000000000000000000000000"
export const defaultToken = { address: zeroAddress, func: zeroAddress, fee: 0, funcName: "Send", tokenName: "ETH", tokenDecimal: "18" }

export const handleConnectToWallet = ({ setAddress, setMainETHAddress, setTxs, setIsOpen }) => async () => {
    setIsOpen(true)
    // await ethAPI.connect()
    // if (!ethAPI.isConnected()) { return }
    // const ethAddress = await ethAPI.getAddress()
    // const gaslessAddress = await ethAPI.getGaslessWalletAddress(0)
    // setAddress(gaslessAddress)
    // setMainETHAddress(ethAddress)
    // const txs = await ethAPI.getTransactionCount()
    // setTxs(txs)
}

export const getInitialDetails = async ({ address, setNetwork, setBalance, setSupportedTokensAndFees }) => {
    const network = await ethAPI.getNetwork()
    setNetwork(network)
    const supportedTokensAndFees = await ethAPI.getSupportedTokensAndFee()
    if (supportedTokensAndFees.length > 0) {
        const supportedTokensDetails = await Promise.all(supportedTokensAndFees.map(async stf => {
            const tokenName = await ethAPI.getTokenName(stf.address)
            const tokenDecimal = await ethAPI.getTokenDecimals(stf.address)
            return { ...stf, tokenName, tokenDecimal }
        }))
        supportedTokensDetails.push(defaultToken)
        setSupportedTokensAndFees(supportedTokensDetails)
        const defaultSelected = supportedTokensDetails[0]
        const balance = await ethAPI.getTokenBalance(defaultSelected.address, address)
        setBalance(balance)
    }
}

export const handleSelectedToken = (supportedTokensAndFees = [defaultToken], setSelectedToken) => (e) => {
    const { value } = e.target
    for (const t of supportedTokensAndFees) {
        if (t.address === value) {
            setSelectedToken(t)
            return
        }
    }
}

export const handleSelectedCurrencyChanged = async ({ supportedTokensAndFees, selectedCurrency, address, setBalance, setCurrencyFuncs }) => {
    if (selectedCurrency.address === zeroAddress) { return }
    const newBalance = await ethAPI.getTokenBalance(selectedCurrency.address, address)
    console.log({ newBalance })
    setBalance(newBalance)
    const filter = {}
    const filtered = supportedTokensAndFees.filter(stf => {
        if (selectedCurrency.address === stf.address && !filter[stf.func]) {
            filter[stf.func] = true
            return stf
        }
    })
    setCurrencyFuncs(filtered)
}

export const handleGaslessSend = async (tokenAddress, func, receipientAddress, amount, fee, addressIndex, address, privateKey = "") => {
    await ethAPI.sendGaslessTokenTx(tokenAddress, func, receipientAddress, amount, fee, addressIndex, address, privateKey = "")
}

export const watchBalance = (token, address, setBalance) => async () => {
    const bal = await ethAPI.getTokenBalance(token, address)
    setBalance(bal)
}


export const createWallet = () => {
    
}