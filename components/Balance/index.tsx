
export default function Balance({selected, balance, onSelect, options}){
    return (
        <div className="flex flex-wrap absolute right-0 bottom-0 ml-auto items-end text">
            <span className="text-white font-semibold text-3xl md:text-4xl leading-none">{formatBalance(balance, selected.tokenDecimal)}</span>
            <span className="text-white ml-1">
                <select value={selected.address} onChange={onSelect} className="bg-transparent border-none outline-none">
                    {options.map(opt => <option value={opt.address} key={opt.address}>{opt.tokenName}</option>)}
                </select>
            </span>
        </div>
    )
}

const formatBalance = (balance, decimals) => {
    console.log({balance, decimals})
    const _dec = Number(decimals) > 6 ? 6 : decimals
    const _bal = Number(balance) / 10**(Number(decimals))
    return Number(_bal).toFixed(_dec)
}
