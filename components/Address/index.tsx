import { CopyIcon } from "../../SVGIcons";

export default function Address({address, onClick=()=>{}, copied}){
    return (
        <div onClick={onClick} className="flex w-full mt-2 text-xs md:text-base items-center leading-none text-dirty-white hover:text-white cursor-pointer">
            {
                copied
                    ? <span className="mr-1 text-sm">√</span>
                    : <CopyIcon className="h-4 mr-1 fill-current" />
            }
            <span className="float-right">{copied ? "Copied!" : formatAddress(address)}</span>
        </div>
    )
}

const formatAddress = (address: string) => `${address.substring(0, 5)}...${address.substring(address.length-3, address.length)}`
