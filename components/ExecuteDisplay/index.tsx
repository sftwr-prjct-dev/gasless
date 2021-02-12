import { useEffect, useState } from "react"
import { defaultToken } from "../../handlers"
import SwapTokenDisplay from "../SwapTokenDisplay"
import TrasferTokenDisplay from "../TransferTokenDisplay"

export default function ExecuteDisplay({ currencyFuncs, balance, mainETHAddress, gaslessAddress }) {
    const [selectedFunction, setSelectedFunction] = useState(defaultToken)
    useEffect(() => {
        const f =  currencyFuncs.filter(cf => cf.funcName.toLowerCase().startsWith("swap"))[0]
        if(f){
            const _f = {...f}
            _f.funcName = "Swap (1inch)"
            currencyFuncs.push(_f)
            setSelectedFunction(currencyFuncs[0])
        }
        
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
                {currencyFuncs.map((cf, index) => <option key={`${cf.func}${index}`} value={cf.func} >{`${cf.funcName} (Fee: ${(Number(cf.fee) / 10 ** Number(cf.tokenDecimal)).toFixed(Number(cf.tokenDecimal))} ${cf.tokenName})`}</option>)}
            </select>
            <Display selectedFunction={selectedFunction} balance={balance} mainETHAddress={mainETHAddress} gaslessAddress={gaslessAddress} />
        </div>
    )
}


const displays = {
    "transfer": TrasferTokenDisplay,
    "swap": SwapTokenDisplay,
    "OneInch": SwapTokenDisplay
}

const getDisplay = (selectedFunctionName: string) => {
    return displays[selectedFunctionName.toLowerCase().split(" ")[0]] || (() => <div className="w-full h-56"></div>)
}
