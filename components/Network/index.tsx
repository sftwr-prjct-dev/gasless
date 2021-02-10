import Button from "../Button";
import PingPing from "../PingPing";

export default function Network({ network, setIsOpen }) {
    let bgcolor, textcolor, btnText
    if(network !== ""){
        bgcolor = "bg-green-400"
        textcolor = "text-green-400" 
        btnText = network
    }else {
        bgcolor = "bg-red-500"
        textcolor = "text-red-500"
        btnText = "Connect Wallet"
    }
    
    return (
        <div className="flex items-center absolute right-0 top-0">
            <Button
                onClick={setIsOpen}
                text={`${btnText}`}
                className={`${textcolor}`}
                disabled={!!network}
            />
            <PingPing color={bgcolor} />
        </div>
    )
}
