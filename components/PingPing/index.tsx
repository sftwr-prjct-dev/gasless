export default function PingPing({color}){
    return (
        <div className={`${color} rounded-full h-2 w-2 ml-2 relative`}>
            <div className={`${color} rounded-full h-2 w-2 absolute animate-ping`}></div>
        </div>
    )
}