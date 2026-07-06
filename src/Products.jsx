import React from "react";
import {Link} from "react-router-dom";
function Products({items})
{
    return (
      <>  
   <div id="p2">
    <nav id="nav">
        <Link to="/counter">Counter</Link>
        </nav>      
    { items.map((product,index)=>(
         <div key={index} id="product-container">
            <img src={product.img} alt={product.title}/>
            <p>{product.title}</p>
            <p>{product.price}</p>
            <p>{product.reviews}</p>
            <button id="p">Review</button>
            </div>
     )) }
    
    </div>

    </>
    
    );
}
export default Products
