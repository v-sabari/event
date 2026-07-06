import React,{useState,useEffect} from "react"

function Counter(){
    let[count,setCount]=useState(0);
    const hI=()=>
        setCount(count+1);
    const hD=()=>
        setCount(count-1);
    useEffect(()=>{
console.log("hello");
    },[count]);


    return (
        <div>
            <h2>{count}</h2>
        <button onClick={hI}>Increase</button>
        <button onClick={hD}>Decrease</button>
        </div>
    ) 
}
export default Counter