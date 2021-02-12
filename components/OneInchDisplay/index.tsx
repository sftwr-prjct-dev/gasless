import { useEffect, useState } from "react"
import { getUniswapTradeRoute, getSwapDetails, handleGaslessSwap, getOneInchData, gasless1InchSwap } from "../../handlers"
import {SwapIcon} from "../../SVGIcons"
import Modal from "../Modal"

const emptyDetails = {amountIn: "", amountOutMin: "", callData: ""}
export default function SwapTokenDisplay({ selectedFunction, balance, mainETHAddress, gaslessAddress }) {
    const [sendAmount, setSendAmount] = useState("")
    const [swapDetails, setSwapDetails] = useState(emptyDetails)
    const {amountIn, amountOutMin: _amountOutMin, callData} = swapDetails
    const amountOutMin = _amountOutMin ? (Number(_amountOutMin.toString())/10**18).toFixed(6) : ""
    const [sendAddress, setSendAddress] = useState(mainETHAddress)
    const [route, setRoute] = useState(undefined)
    const [token0, setToken0] = useState(undefined)

    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [tx, setTx] = useState({network:"", txHash: ""})
    const {network, txHash} = tx

    useEffect(() => {
        getUniswapTradeRoute(setRoute, setToken0, selectedFunction)
        console.log("gotten trade route")
    }, [selectedFunction])

    const handleChange = (setter) => async (e) => {
        const { value, name } = e.target
        setter(value)
        if(name === 'address')return
        if(!value || value === "0"){
            setSwapDetails(emptyDetails)
            return
        }
        const amount = Math.floor(Number(value)*10**Number(selectedFunction.tokenDecimal)).toString()
        if(!!amount && amount !== "0" ){
            try {
                console.log("calccc", amount)
                await getSwapDetails(setSwapDetails, route, token0, amount , sendAddress)
            } catch (error) {
                console.log(error)
            }
        }
    }

    const _tokenDecimal = Number(selectedFunction.tokenDecimal)
    const decimals = 10 ** _tokenDecimal
    const feeValue = Number(selectedFunction.fee)
    const _fee = feeValue / decimals
    const _sendAmount = Number(sendAmount)
    const sendAmountValue = _sendAmount * decimals
    const _total = (_fee + _sendAmount).toFixed(_tokenDecimal > 6 ? 6 : _tokenDecimal)

    const closeModal = () => {
        setTx({network:"", txHash:""})
        setIsOpen(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (sendAddress && (sendAmountValue + feeValue) <= balance) {
                const data = await getOneInchData(
                    "0x6b175474e89094c44da98b954eedeac495271d0f",
                    "0x6b175474e89094c44da98b954eedeac495271d0f",
                    _total,
                    gaslessAddress,
                )
                const tx = await gasless1InchSwap(
                    "0x6b175474e89094c44da98b954eedeac495271d0f",
                    data.spender,
                    data.approveData,
                    data.spendData,
                )
                if(tx.txHash){
                    setTx({network:"kovan", txHash: ""})
                    setIsOpen(true)
                }
            }
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        
    }

    return (
        <div>
            <Modal setIsOpen={closeModal} isOpen={isOpen}>
                <div className="w-full h-32 text-center">
                    <div className="text-xl opacity-75">Transaction successfully Sent</div>
                    <a href={`https://${network === 'homestead' ? '' : network+'.'}etherscan.io/tx/${txHash}`} target="_blank">
                        <button className="bg-white text-dirt-white rounded-md h-12 w-11/12 mt-6">View on Etherscan</button>
                    </a>
                </div>
            </Modal>
            <form onSubmit={handleSubmit} className="w-full block px-4 pb-4">
                <label className="text-dirty-white w-full block mt-2">Recipient Address</label>
                <input
                    className=" bg-gray-400 h-10 mt-2 pl-4 text-dirty-white text-xl w-full"
                    onChange={handleChange(setSendAddress)}
                    name="address"
                    value={sendAddress}
                    placeholder="Enter an Ethereum Address" />

                <div className="flex flex-wrap justify-between w-full mt-4">
                    <div className="flex flex-wrap w-32 pr-1">
                        <label className="text-dirty-white w-full block">Send {selectedFunction.tokenName}</label>
                        <input
                            type="number"
                            className="bg-gray-400 w-full h-10 text-dirty-white text-right text-xl"
                            onChange={handleChange(setSendAmount)}
                            value={sendAmount}
                            placeholder="Amount"
                        />
                    </div>
                    <div className="h-auto items-end flex flex-wrap w-16">
                        <SwapIcon className="w-full h-10" />
                    </div>
                    <div className="flex flex-wrap w-32 pr-l">
                        <label className="text-dirty-white w-full block">Receive ETH</label>
                        <input
                            type="number"
                            disabled
                            className="bg-gray-400 w-full h-10 text-dirty-white text-right text-xl"
                            onChange={handleChange(setSendAmount)}
                            value={amountOutMin}
                            placeholder="Amount"
                        />
                    </div>
                </div>
                <div className="w-full mt-6">
                    <div className="text-dirty-white float-left">
                        <span className="mr-2">Rate</span>
                        <span className="">
                            {`1 TKN = 0.00035 ETH`}
                        </span>
                    </div>
                    <div className="text-dirty-white float-right">
                        <span className="mr-2">Total</span>
                        <span className="">
                            {`${_total} ${selectedFunction.tokenName}`}
                        </span>
                    </div>
                </div>
                <button disabled={loading} className="w-full h-12 mt-2 bg-green-700 text-white font-extrabold">{loading ? "Processing" : "Swap"}</button>
            </form>
        </div>
        
    )
}