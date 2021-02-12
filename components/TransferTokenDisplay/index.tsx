import { useState } from "react"
import { handleGaslessSend } from "../../handlers"
import Modal from "../Modal"

export default function TrasferTokenDisplay({selectedFunction, balance, mainETHAddress}){
    const [sendAmount, setSendAmount] = useState("0")
    const [sendAddress, setSendAddress] = useState("")
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [tx, setTx] = useState({network:"", txHash: ""})
    const {network, txHash} = tx

    const handleChange = (setter) => (e) => {
        const { value } = e.target
        setter(value)
    }

    const closeModal = () => {
        setTx({network:"", txHash:""})
        setIsOpen(false)
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
        setLoading(true)
        try {
            if(sendAddress && (sendAmountValue+feeValue) <= balance){
                const tx = await handleGaslessSend(
                    selectedFunction.address,
                    selectedFunction.func,
                    sendAddress,
                    sendAmountValue,
                    feeValue,
                    0,
                    mainETHAddress,
                    ""
                )
                if(tx.txHash){
                    setTx(tx)
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
        <>
            <Modal setIsOpen={closeModal} isOpen={isOpen}>
                <div className="w-full h-32 text-center">
                    <div className="text-xl opacity-75">Transaction successfully Sent</div>
                    <a href={`https://${network === 'homestead' ? '' : network+'.'}etherscan.io/tx/${txHash}`} target="_blank">
                        <button className="bg-white text-dirt-white rounded-md h-12 w-11/12 mt-6">View on Etherscan</button>
                    </a>
                </div>
            </Modal>
            <form onSubmit={handleSubmit} className="w-full px-4 pb-4">
                    <label className="text-dirty-white w-full block mt-2">Recipient</label>
                    <input
                        className=" bg-gray-400 h-10 mt-2 pl-4 text-dirty-white text-xl w-full"
                        onChange={handleChange(setSendAddress)}
                        value={sendAddress}
                        placeholder="Enter an Ethereum Address" />

                    <div className="w-full mt-4">
                        <label className="text-dirty-white w-full block">Amount</label>
                        <div className="flex flex-wrap mt-2 h-10">
                            <input
                                type="number"
                                className="bg-gray-400 w-7/12 h-full pr-4 text-dirty-white text-right text-xl"
                                onChange={handleChange(setSendAmount)}
                                value={sendAmount}
                                placeholder="Amount" />
                            <div className="text-dirty-white h-full relative w-5/12 leading-none">
                                <div className="w-auto absolute top-0 left-0 ml-4">Total</div>
                                <div className="text-sm absolute bottom-0 left-0 ml-4 w-auto mt-auto whitespace-no-wrap">
                                    {`${_total} ${selectedFunction.tokenName}`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button disabled={loading} className="w-full h-12 mt-6 bg-green-700 text-white font-extrabold">{loading ? "Sending" : "Send"}</button>
            </form>
        </>
    )
}
