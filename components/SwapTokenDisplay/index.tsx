import { useEffect, useState } from "react"
import { getUniswapTradeRoute, getSwapDetails, handleGaslessSwap } from "../../handlers"
import {SwapIcon} from "../../SVGIcons"

const emptyDetails = {amountIn: "", amountOutMin: "", callData: ""}
export default function SwapTokenDisplay({ selectedFunction, balance, mainETHAddress }) {
    const [sendAmount, setSendAmount] = useState("")
    const [swapDetails, setSwapDetails] = useState(emptyDetails)
    const {amountIn, amountOutMin: _amountOutMin, callData} = swapDetails
    const amountOutMin = _amountOutMin ? (Number(_amountOutMin.toString())/10**18).toFixed(6) : ""
    const [sendAddress, setSendAddress] = useState(mainETHAddress)
    const [route, setRoute] = useState(undefined)
    const [token0, setToken0] = useState(undefined)

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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (sendAddress && (sendAmountValue + feeValue) <= balance) {
            await handleGaslessSwap(
                selectedFunction.address,
                selectedFunction.func,
                feeValue,
                0,
                mainETHAddress,
                callData,
                ""
            )
        }
    }

    return (
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
            <button className="w-full h-12 mt-2 bg-green-700 text-white font-extrabold">Swap</button>
        </form>
    )
}