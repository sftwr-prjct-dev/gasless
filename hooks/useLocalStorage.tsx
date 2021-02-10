import { useEffect } from "react";

export default function UseLocalStorage(){
    useEffect(() => {
        const k = localStorage.getItem("key")
        console.log(k)
    })
    return <></>
}