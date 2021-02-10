import { useEffect, useState } from "react"
import { defaultToken } from "../../handlers"
import SwapTokenDisplay from "../SwapTokenDisplay"
import TrasferTokenDisplay from "../TransferTokenDisplay"

export default function ExecuteDisplay({ currencyFuncs, balance, mainETHAddress }) {
    const [selectedFunction, setSelectedFunction] = useState(defaultToken)
    useEffect(() => {
        setSelectedFunction(currencyFuncs[0])
    }, [currencyFuncs])

    const handleSelectedFunc = (e) => {
        const { value } = e.target
        const _selectedFunc = currencyFuncs.filter(cf => cf.func === value)
        setSelectedFunction(_selectedFunc[0])
    }

    const Display = getDisplay(selectedFunction.funcName)

    return (
        <div className="bg-dark-gray mt-4 p-2 w-full rounded-md relative">
            <select value={selectedFunction.func} onChange={handleSelectedFunc} className="text-dirt-white bg-transparent border-none outline-none">
                {currencyFuncs.map(cf => <option key={cf.func} value={cf.func} >{`${cf.funcName} (Fee: ${(Number(cf.fee) / 10 ** Number(cf.tokenDecimal)).toFixed(Number(cf.tokenDecimal))} ${cf.tokenName})`}</option>)}
            </select>
            <Display selectedFunction={selectedFunction} balance={balance} mainETHAddress={mainETHAddress} />
        </div>
    )
}


const displays = {
    "transfer token": TrasferTokenDisplay,
    "swap token": SwapTokenDisplay,
}

const getDisplay = (selectedFunctionName: string) => {
    return displays[selectedFunctionName.toLowerCase()] || (() => <div className="w-full h-56"></div>)
}
