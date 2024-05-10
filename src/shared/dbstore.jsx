import {baseURL} from '../utils/constants'

const storeBasket=async(basket)=>{
   const response = await fetch(baseURL+"/api/basket/save",{
        method:'Post',
        headers:{'Content-Type':'application/json'},
        body:basket
    });
    const returnData= await response.json();
    return returnData;
}
const removeBasketStore=async(basketId)=>{
    const response= await fetch(baseURL+"/api/basket/removebasket",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basketId
    });
    const returnData=await response.json();
    return returnData;
}
const getBasketById= async(id,addr)=>{
    const response= await fetch(baseURL+"/api/basket/getbasket/"+id+"/"+addr);
    const returnData=await response.json();
    return returnData;
}
const getBasketsByOwner= async(owner)=>{
    const response = await fetch(baseURL+"/api/basket/getbasketsbyowner/"+owner);
    const responsData= await response.json();
    return responsData;
}
const getBasketsByRecency=async(indexStart, indexEnd, isActive)=>{
    const response= await fetch(baseURL +"/api/basket/getbasketsbyrecency/"+indexStart+"/"+indexEnd+(isActive===null?"":(isActive?"/true":"/false")));
    const responsData=await response.json();
    return responsData;
}
const searchBaskets = async(searchTerm)=>{
    const response=await fetch(baseURL+"/api/basket/searchbaskets/"+searchTerm);
    const responseData=await response.json();
    return responseData;
}
const storeBasketOffer = async(basketOffer)=>{
    const response= await fetch(baseURL+"/api/basket/addbasketoffer",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basketOffer  
      });
      const returnData=await response.json();
      return returnData;
}
const removeBasketOffer=async(offerId)=>{
    const response= await fetch(baseURL+"/api/basket/removeoffer",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:offerId
    });
    const returnData=await response.json();
    return returnData;
}
const storeBasketNFT= async(basketNFT)=>{
    const response= await fetch(baseURL+"/api/basket/addnft",{
      method:"Post",
      headers:{'Content-Type':'application/json'},
      body:basketNFT  
    });
    const returnData=await response.json();
    return returnData;
}
const removeBasketNFT=async(basketNFTId)=>{
    const response= await fetch(baseURL+"/api/basket/removenft",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basketNFTId
    });
    const returnData=await response.json();
    return returnData;
}
const updateTfuel=async(basket)=>{
    const response= await fetch(baseURL+"/api/basket/updatetfuelInbasket",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basket
    });
    const returnData=await response.json();
    return returnData
}
const updateActiveInactive=async(basket)=>{
    const response= await fetch(baseURL+"/api/basket/updatebasketactiveinactive",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basket
    });
    const returnData=await response.json();
    return returnData
}
const updateOfferAccepted=async(basketOffer)=>{
    const response= await fetch(baseURL+"/api/basket/updateofferaccepted",{
        method:"Post",
        headers:{'Content-Type':'application/json'},
        body:basketOffer
    });
    const returnData=await response.json();
    return returnData
}
export {
        storeBasket,
        getBasketById,
        storeBasketOffer,
        removeBasketOffer,
        storeBasketNFT,
        removeBasketNFT,
        updateTfuel,
        updateActiveInactive,
        updateOfferAccepted,
        removeBasketStore,
        getBasketsByOwner,
        getBasketsByRecency,
        searchBaskets
    }