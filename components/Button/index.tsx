
export default function Button({className, onClick, text, disabled}){
    return <button disabled={disabled} className={`outline-none focus:outline-none border-none ${className}`} onClick={onClick}>{text}</button>
}
