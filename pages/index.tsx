import dynamic from 'next/dynamic'
import QRCode from "qrcode.react"
import { useEffect, useState } from "react"
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Address from "../components/Address"
import Balance from "../components/Balance"
import ExecuteDisplay from "../components/ExecuteDisplay"
// import InAppWallet from "../components/InAppWallet";
import Modal from "../components/Modal";
import Network from "../components/Network"
import Transactions from "../components/Transactions"
import { defaultToken, getInitialDetails, handleConnectToWallet, handleSelectedCurrencyChanged, handleSelectedToken, watchBalance, zeroAddress } from "../handlers"
import useWindowSize from '../hooks/useWindowSize'



const InAppWallet = dynamic(() => import('../components/InAppWallet'), { ssr: false })

export default function Dashboard() {
    const [address, setAddress] = useState("")
    const [network, setNetwork] = useState("")
    const [mainETHAddress, setMainETHAddress] = useState("")
    const [value, setValue] = useState("0")
    const [balance, setBalance] = useState("0")
    const [supportedTokensAndFees, setSupportedTokensAndFees] = useState([defaultToken])
    const [selectedCurrency, setSelectedCurrency] = useState(defaultToken)
    const [currencyFuncs, setCurrencyFuncs] = useState([defaultToken])
    const [txs, setTxs] = useState({})
    const [isOpen, setIsOpen] = useState(false)

    

    useEffect(() => {
        // get and set initial details after wallet connection
        address !== "" && getInitialDetails({address, setNetwork, setBalance, setSupportedTokensAndFees})
        // console.log(Intl.DateTimeFormat().resolvedOptions().timeZone)
    }, [address])

    useEffect(() => {
        setSelectedCurrency(supportedTokensAndFees[0])

    }, [supportedTokensAndFees])


    useEffect(() => {
        if(selectedCurrency.address === zeroAddress || address === zeroAddress){return}

        const int = setInterval(watchBalance(selectedCurrency.address, address, setBalance),5000)
        return () => window.clearInterval(int)
    }, [address, selectedCurrency])
    
    useEffect(() => {
        handleSelectedCurrencyChanged({supportedTokensAndFees,selectedCurrency, address, setBalance, setCurrencyFuncs})
    }, [selectedCurrency])


    return (
        <div className="md:flex flex-wrap justify-center items-center h-screen w-full bg-light-gray overflow-y-scroll">
            {
                isOpen && <Modal>
                            <InAppWallet />
                        </Modal>
            }
            <div className="flex flex-col justify-between h-screen w-full md:h-auto md:w-auto md:max-h-650 md:max-w-300 p-4 md:p-8 shadow-md rounded-md bg-transparent md:bg-thin-gray">
                <DetailsDisplay
                    handleConnectToWallet={handleConnectToWallet({ setAddress, setMainETHAddress, setTxs, setIsOpen })}
                    address={address} value={value}
                    balance={balance}
                    selectedCurrency={selectedCurrency}
                    setSelectedCurrency={handleSelectedToken(supportedTokensAndFees, setSelectedCurrency)}
                    network={network}
                    options={supportedTokensAndFees}
                />
                <ExecuteDisplay
                    currencyFuncs={currencyFuncs}
                    balance={balance}
                    mainETHAddress={mainETHAddress}
                />

                <Transactions txs={txs}/>
            </div>
        </div>
    )
}

const DetailsDisplay = ({address, balance, value, network, selectedCurrency, setSelectedCurrency, handleConnectToWallet, options}) => {
    const { width } = useWindowSize()
    const isSmallScreen = width < 768
    return (
        <>
            <div className="flex flex-wrap relative">
                <QRCode size={isSmallScreen ? 85 : 100} bgColor="rgb(112,112,112)" value={makeQrURI("ETH", address, value)} />
                <Network network={network} handleConnectToWallet={handleConnectToWallet} />
                <Balance balance={balance} selected={selectedCurrency} onSelect={setSelectedCurrency} options={options} />
            </div>
            <CopyToClipboard text={address}>
                <Address address={address} />
            </CopyToClipboard>
        </>
    )
}

const coins = {
    "BTC": "bitcoin",
    "ETH": "ethereum",
}

export const makeQrURI = (coin, address, amount) => {
    return encodeURI(`${coins[coin]}:${address}?amount=${amount}&label=nullsender&message=nullsender`)
}
