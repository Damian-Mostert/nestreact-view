import { useEffect } from "react"

export default function Test(){
    useEffect(()=>{
        alert("Client side rendering is the best")
    },[])
    return <div>Hello world</div>
}