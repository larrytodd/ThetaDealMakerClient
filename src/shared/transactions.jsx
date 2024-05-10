import {ethers} from 'ethers';
import {contractDealCreationAbi, contractDealCreationAddress} from '../utils/constants'

const connectWallet= async () => {
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);    
        await provider.send("eth_requestAccounts", []);
        const objSigner= await provider.getSigner();
        const objAddress = await objSigner.getAddress();
        const objBalance=await provider.getBalance(objAddress);
        return {address:objAddress, signer:objSigner,balance:objBalance}
      } else {
          return {address:null,signer:null}
      }
  }
  const metaMaskConnected=async()=>{
    if(window.ethereum){
      const provider = new ethers.BrowserProvider(window.ethereum);    
      const accounts =await provider.listAccounts();
      if(accounts.length>0){
        const objSigner= await provider.getSigner();
        const objAddress = await objSigner.getAddress();
        const objBalance=await provider.getBalance(objAddress);
        return {address:objAddress, signer:objSigner,balance:objBalance}
      }
    }
    return {address:null,signer:null}
  } 
  const createBasket=async(defaultAccount,defaultSigner)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract= await getContract(defaultSigner);
        const transaction= await contract.createBasket(false);
        const basketCreated= await transaction.wait();
        var basketId;
        for(var i=0;i<basketCreated.logs.length;i++){
          if(basketCreated.logs[i].args){
            basketId=basketCreated.logs[i].args[0].toString();
          }
        }
        return basketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const addTfuelToBasket=async(defaultAccount,defaultSigner,amount,basketId)=>{
    if(window.ethereum && defaultAccount){
      try{
          const contract = await getContract(defaultSigner);
          const transaction = await contract.addTfuelToBasket(basketId, {value:amount});
          const tfuelAdded=await transaction.wait();
          return tfuelAdded;
      }catch(error){
        console.log(error);
      }
    }
  }
  const removeTfuelFromBasket=async(defaultAccount,defaultSigner,amount,basketId)=>{
    if(window.ethereum && defaultAccount){
      try{
          const contract = await getContract(defaultSigner);
          //TODO: Change functionality to send as variable, instead of value. You are removing not adding.
          const transaction = await contract.removeTfuelFromBasket(basketId, amount);
          const tfuelRemoved=await transaction.wait();
          return tfuelRemoved;
      }catch(error){
        console.log(error);
      }
    }
  }
  const addNFTToBasket= async(defaultAccount,defaultSigner,nftAddress,tokenId,basketId)=>{
    if(window.ethereum && defaultAccount){
      try{
          const contract= await getContract(defaultSigner);
          await approveNFTTransfer(nftAddress,tokenId,defaultSigner);
          const transaction= await contract.addNFT(nftAddress,tokenId,basketId,{gasLimit:5000000});
          const nftAdded= await transaction.wait();
          //TODO:Turn this into something more unique in the contract
          var returnedBasketId;
          for(var i=0;i<nftAdded.logs.length;i++){
            if(nftAdded.logs[i].args){
              returnedBasketId=nftAdded.logs[i].args[0].toString();
            }
          }
          return returnedBasketId;
      }catch(error){
        console.log(error)
      }
    }
  }
  const removeNFTFromBasket=async(defaultAccount,defaultSigner,nftAddress,tokenId,basketId)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract= await getContract(defaultSigner);
        const transaction= await contract.removeNFT(nftAddress,tokenId,basketId,{gasLimit:750000});
        const nftRemoved= await transaction.wait();
        var returnedBasketId;
        for(var i=0;i<nftRemoved.logs.length;i++){
          if(nftRemoved.logs[i].args){
            returnedBasketId=nftRemoved.logs[i].args[0].toString();
          }
        }
        return returnedBasketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const setBasketActiveInactive = async(defaultAccount,defaultSigner,basketId,active)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract=await getContract(defaultSigner);
        var transaction;
        if(active){
          transaction=await contract.setBasketActive(basketId,{gasLimit:750000});
        }else{
          transaction=await contract.setBasketInactive(basketId,{gasLimit:750000});
        }
        const basketActiveDeactivated= await transaction.wait();
        return basketActiveDeactivated
      }catch(error){
        console.log(error);
      }
    }
  }
  const removeBasket=async(defaultAccount,defaultSigner,basketId)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract= await getContract(defaultSigner);
        const transaction= await contract.removeBasket(basketId,{gasLimit:750000});
        const basketRemoved= await transaction.wait();
        var returnedBasketId;
        for(var i=0;i<basketRemoved.logs.length;i++){
          if(basketRemoved.logs[i].args){
            returnedBasketId=basketRemoved.logs[i].args[0].toString();
          }
        }
        return returnedBasketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const offerBasket=async(defaultAccount, defaultSigner, basketIdOffer, basketIdOfferOn)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract=await getContract(defaultSigner);
        const transaction= await contract.offerBasket(basketIdOffer,basketIdOfferOn);
        const basketOffered= await transaction.wait();
        var returnedBasketId;
        for(var i=0;i<basketOffered.logs.length;i++){
          if(basketOffered.logs[i].args){
            returnedBasketId=basketOffered.logs[i].args[0].toString();
          }
        }
        return returnedBasketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const removeOfferBasket= async(defaultAccount, defaultSigner, basketIdOffer, basketIdOfferOn)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract=await getContract(defaultSigner);
        const transaction= await contract.removeOfferBasket(basketIdOffer,basketIdOfferOn);
        const basketOfferRemoved= await transaction.wait();
        var returnedBasketId;
        for(var i=0;i<basketOfferRemoved.logs.length;i++){
          if(basketOfferRemoved.logs[i].args){
            returnedBasketId=basketOfferRemoved.logs[i].args[0].toString();
          }
        }
        return returnedBasketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const acceptBasketOffer = async(defaultAccount,defaultSigner,basketIdAccepted, basketIdOfferOn)=>{
    if(window.ethereum && defaultAccount){
      try{
        const contract=await getContract(defaultSigner);
        const transaction= await contract.acceptBasketOffer(basketIdAccepted,basketIdOfferOn,{gasLimit:1000000});
        const basketOfferAccepted= await transaction.wait();
        var returnedBasketId;
        for(var i=0;i<basketOfferAccepted.logs.length;i++){
          if(basketOfferAccepted.logs[i].args){
            returnedBasketId=basketOfferAccepted.logs[i].args[0].toString();
          }
        }
        return returnedBasketId;
      }catch(error){
        console.log(error);
      }
    }
  }
  const getContract= async(defaultSigner)=>{
    const transactionContract= new ethers.Contract(
      contractDealCreationAddress,
      contractDealCreationAbi,
      defaultSigner
    );
    return transactionContract
  }
  const getTokenURI= (address, id)=> {
    const abi = [
        "function tokenURI(uint256 _tokenId) external view returns (string)",
      ];
      const provider = new ethers.BrowserProvider(window.ethereum); 
      const tokenContract= new ethers.Contract(address,abi,provider);
      const uri= tokenContract.tokenURI(id);
      return uri;
  }
  const getTokenOwner= (address, id)=> {
    const abi = [
        "function ownerOf(uint256 _tokenId) external view returns (address)",
      ];
      const provider = new ethers.BrowserProvider(window.ethereum); 
      const tokenContract= new ethers.Contract(address,abi,provider);
      const owner= tokenContract.ownerOf(id);
      return owner;
  }
  const approveNFTTransfer = async(address,id,signer)=>{
    const abi=[
      "function approve(address _approved, uint256 _tokenId) external payable"
    ];
    const tokenContract=new ethers.Contract(address,abi,signer);
    await tokenContract.approve(contractDealCreationAddress,id,{gasLimit:1000000});
  }
  
  export {
    connectWallet,
    createBasket,
    getTokenURI,
    metaMaskConnected,
    addNFTToBasket,
    removeNFTFromBasket,
    getTokenOwner,
    addTfuelToBasket,
    removeTfuelFromBasket,
    setBasketActiveInactive,
    removeBasket,
    offerBasket,
    removeOfferBasket,
    acceptBasketOffer
  }
