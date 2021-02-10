import { useState } from "react"
import { handleGaslessSend } from "../../handlers"

export default function TrasferTokenDisplay({selectedFunction, balance, mainETHAddress}){
    const [sendAmount, setSendAmount] = useState("0")
    const [sendAddress, setSendAddress] = useState("")

    const handleChange = (setter) => (e) => {
        const { value } = e.target
        setter(value)
    }

    const _tokenDecimal = Number(selectedFunction.tokenDecimal)
    const decimals = 10 ** _tokenDecimal
    const feeValue = Number(selectedFunction.fee)
    const _fee = feeValue / decimals
    const _sendAmount = Number(sendAmount)
    const sendAmountValue = _sendAmount*decimals
    const _total = (_fee + _sendAmount).toFixed(_tokenDecimal > 6 ? 6 : _tokenDecimal)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(sendAddress && (sendAmountValue+feeValue) <= balance){
            await handleGaslessSend(
                selectedFunction.address,
                selectedFunction.func,
                sendAddress,
                sendAmountValue,
                feeValue,
                0,
                mainETHAddress,
                ""
            )
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full px-4 pb-4">
                <label className="text-dirty-white w-full block mt-2">Recipient</label>
                <input
                    className=" bg-gray-400 h-10 mt-2 pl-4 text-dirty-white text-xl w-full"
                    onChange={handleChange(setSendAddress)}
                    value={sendAddress}
                    placeholder="Enter an Ethereum Address" />

                <div className="w-full mt-4">
                    <label className="text-dirty-white w-full block">Amount</label>
                    <div className="flex flex-wrap mt-2 h-10 overflow-x-scroll">
                        <input
                            type="number"
                            className="bg-gray-400 w-7/12 h-full pr-4 text-dirty-white text-right text-xl"
                            onChange={handleChange(setSendAmount)}
                            value={sendAmount}
                            placeholder="Amount" />
                        <div className="text-dirty-white h-full relative w-5/12 leading-none">
                            <div className="w-auto absolute top-0 left-0 ml-4">Total</div>
                            <div className="text-sm absolute bottom-0 left-0 ml-4 w-auto mt-auto whitespace-no-wrap overflow-x-scroll">
                                {`${_total} ${selectedFunction.tokenName}`}
                            </div>
                        </div>
                    </div>
                </div>
                <button className="w-full h-12 mt-6 bg-green-700 text-white font-extrabold">Send</button>
            </form>
    )
}