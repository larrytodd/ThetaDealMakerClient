import tfuelLogo from '../assets/theta-fuel-tfuel-logo.svg';
import { Spinner, SimpleGrid, Box, Center,VStack,HStack, Image, Button,Heading, Text, Link, Input, IconButton, Grid, Card, CardHeader, Container, CardBody, Flex, Divider, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody} from '@chakra-ui/react'
import { DeleteIcon, CloseIcon, ArrowBackIcon,AddIcon,MinusIcon } from '@chakra-ui/icons';
import  {useContext, useEffect, useState,useRef} from 'react';
import {Contexts} from '../utils/contexts'
import { getBasketById, storeBasketNFT, removeBasketNFT,updateTfuel, updateActiveInactive,removeBasketStore, removeBasketOffer, updateOfferAccepted } from '../shared/dbstore';
import { addNFTToBasket, removeNFTFromBasket,addTfuelToBasket,removeTfuelFromBasket, setBasketActiveInactive,removeBasket, removeOfferBasket, acceptBasketOffer } from '../shared/transactions';
import { ethers, toBigInt, toNumber } from 'ethers';
import {getTokenURI} from '../shared/transactions'
//import { getTokenOwner } from '../shared/transactions';
import { useNavigate,useParams  } from "react-router-dom";

function BasketDetail(){
  const routeParams=useParams();
  // eslint-disable-next-line no-unused-vars
  const {defaultAccount, setDefaultAccount}=useContext(Contexts);
  // eslint-disable-next-line no-unused-vars
  const {defaultSigner, setDefaultSigner}= useContext(Contexts);
  // eslint-disable-next-line no-unused-vars
  const {defaultBalance,setDefaultBalance}=useContext(Contexts);
  const {setopenOfferBasketList}=useContext(Contexts);
  const {setOfferBasketId}=useContext(Contexts);
  const {setOfferBasketName}= useContext(Contexts);
  const hasMounted = useRef(false);
  const [isLoading,setIsLoading]=useState(true);
  const [isLoadingWallet, setIsLoadingWallet] = useState("");
  const [isLoadingBasketNFT, setIsLoadingBasketNFT] = useState("");
  const [basket,setBasket]=useState(null);
  const [OffersMade,setOffersMade]=useState([]);
  const [OffersReceived,setOffersReceived]=useState([]);
  const [isUpdatingAcceptOffer,setIsUpdatingAcceptOffer]=useState(false);
  const [isUpdatingRejectOffer,setIsUpdatingRejectOffer]=useState(false);
  const [ShowOffer, setShowOffer]=useState(false);
  const [offeredBasket,setOfferedBasket]=useState(null);
  const [isRejectingOffer, setIsRejectingOffer]=useState([]);
  const [isRemovingOffer, setIsRemovingOffer]=useState([]);
  const [isUpdatingAcceptOffers,setIsUpdatingAcceptOffers]=useState([]);
  const [openOfferAcceptedModal,setopenOfferAcceptedModal]=useState(false);
  const [nftsInWallet,setNFTsInWallet]=useState(null);
  const [nftsToShowInWallet,setNFTsToShowInWallet]=useState(null);
  const [hideShowViewMoreNFTs,setHideShowViewMoreNFTs]=useState(false);
  const [nftsInBasket,setNFTsInBasket]=useState(null);
  const [tfuelInputVisible,setTfuelInputVisible]=useState(false);
  const [tfuelValue,setTfuelValue]=useState('');
  const [tfuelValueValid,setTfuelValueValid]=useState(true);
  const [isUpdatingTfuel,setIsUpdatingTfuel]=useState(false);
  const [BasketIsActive,setBasketIsActive]=useState(false);
  const [showBasketOffers,setShowBasketOffers]=useState(true);
  const [showOffersMade,setShowOffersMade]=useState(true);
  const [BasketName,setBasketName]=useState('');
  const [isUpdatingBasketActiveInactive, setIsUpdatingBasketActiveInactive]=useState(false);
  const [isRemoving,setIsRemoving]=useState(false);
  const navigate= useNavigate();

  useEffect(()=>{
    if (hasMounted.current) { return; }
    getBasketById(routeParams.basketid,defaultAccount)
    .then(async data=>{
      setBasket(data);
      setBasketName(data.BasketName);
      setTfuelValue(data.TFuel);
      setOffersMade(data.OffersMade);
      setOffersReceived(data.OffersReceived);
      var tokenURIs=[];
      const initWalletcount= (data.NftsInWallet.length>10?10:data.NftsInWallet.length);
      for(let i=0; i<initWalletcount;i++){
       const metaData = await getTokenURI(data.NftsInWallet[i].Address,data.NftsInWallet[i].TokenId);
       const res= await fetch(metaData);
       const resText= await res.text(); 
       try{
        const resJSON = JSON.parse(resText);
        data.NftsInWallet[i].Name=resJSON.name;
        data.NftsInWallet[i].ImageURL=resJSON.image;

       }catch(ex){
        console.log("NFT metadata is not valid JSON.");
       }
       tokenURIs.push(data.NftsInWallet[i]);
      }
      setNFTsToShowInWallet(tokenURIs);
      setNFTsInWallet(data.NftsInWallet);
      setHideShowViewMoreNFTs(data.NftsInWallet.length>tokenURIs.length);
      setNFTsInBasket(data.NftsInBasket);
      setBasketIsActive(data.IsActive);
      setIsLoading(false);
      //TODO:Will bring back offers and offers made. If there are any offers made Deactivate button will not be visible
      
      let isRemovingOfferActive=[];
      data.OffersMade.forEach(()=>{
        isRemovingOfferActive.push(false);
      });
      setIsRemovingOffer(isRemovingOfferActive);

      let acceptOffersUpdating=[];
      let rejectOffersUpdating=[];
      data.OffersReceived.forEach(()=>{
        acceptOffersUpdating.push(false);
        rejectOffersUpdating.push(false);
      });
      setIsUpdatingAcceptOffers(acceptOffersUpdating);
      setIsRejectingOffer(rejectOffersUpdating);

      hasMounted.current = true;
    })
  },[defaultAccount,routeParams]);
  const addNFT= async(nft)=>{
    setIsLoadingWallet(nft.Name+nft.TokenId+"_wallet");
    const basketIdNum= toBigInt(routeParams.basketid);
    const tokenNum=toBigInt(nft.TokenId);
    const result= await addNFTToBasket(defaultAccount,defaultSigner,nft.Address,tokenNum,basketIdNum);
    //TODO:Change the emit in the contract, to be something more identifiable
    if(result===routeParams.basketid){
      nft.BasketId= Number(result);
      const storeBasketNFTResult= await storeBasketNFT(JSON.stringify(nft));
       nft.BasketNFTId=JSON.parse(storeBasketNFTResult).Id;
       var newNFTsToShowInWallet=nftsToShowInWallet.filter(function(item){
        return (item.Address+item.TokenId.toString() !=nft.Address + nft.TokenId.toString());
       }); 
       setNFTsToShowInWallet(newNFTsToShowInWallet);
       var newBasket= basket;
       newBasket.NftsInBasket.push(nft);
       setBasket(newBasket);
       setNFTsInBasket(newBasket.NftsInBasket); 
    }
    setIsLoadingWallet("");
  }
  const removeNFT= async(nft)=>{
    setIsLoadingBasketNFT(nft.Name+nft.TokenId.toString()+"_basket");
    const basketIdNum=toBigInt(routeParams.basketid);
    const tokenNum=toBigInt(nft.TokenId);
    const result= await removeNFTFromBasket(defaultAccount,defaultSigner,nft.Address,tokenNum,basketIdNum);
     if(result===routeParams.basketid){
        const removeBasketNFTResult= await removeBasketNFT(nft.BasketNFTId);
        if(removeBasketNFTResult){
          var newBasket=basket;
          newBasket.NftsInBasket=basket.NftsInBasket.filter(function(item){
            return (item.Address+item.TokenId.toString() !=nft.Address+ nft.TokenId.toString());
           }); 
           setBasket(newBasket);
           setNFTsInBasket(newBasket.NftsInBasket);
           var newNFTsToShowInWallet= nftsToShowInWallet;
           newNFTsToShowInWallet.push(nft);
           setNFTsToShowInWallet(newNFTsToShowInWallet); 
        }
     }
    setIsLoadingBasketNFT("");
  }
  const handleUpdateTfuel= async()=>{
    if(tfuelInputVisible){
      const numTfuelValue=toNumber(tfuelValue);
      if(numTfuelValue> ethers.formatEther(defaultBalance) || numTfuelValue<0){
          console.log("invalid");
          setTfuelValueValid(false);
          return;
      }
      setIsUpdatingTfuel(true);
      setTfuelValueValid(true);
      const basketIdNum= toBigInt(routeParams.basketid);
      var result;
      if(numTfuelValue>basket.TFuel){
        const tfuelToAdd=(numTfuelValue-basket.TFuel).toString();
        result= await addTfuelToBasket(defaultAccount,defaultSigner,ethers.parseEther(tfuelToAdd), basketIdNum);
        console.log(result);
      }else{
        const tfuelToRemove=(basket.TFuel-numTfuelValue).toString();
        result= await removeTfuelFromBasket(defaultAccount,defaultSigner,ethers.parseEther(tfuelToRemove), basketIdNum);
        console.log(result);
      }
      basket.TFuel=numTfuelValue;
      const saveResult= await updateTfuel(JSON.stringify(basket));
      if(saveResult){
        setBasket(basket);
        const provider = new ethers.BrowserProvider(window.ethereum);  
        const newBalance= await provider.getBalance(defaultAccount);
        setDefaultBalance(newBalance);
        setTfuelInputVisible(false);
        setIsUpdatingTfuel(false);
      }else{
        console.log(saveResult);
        //TODO:Need to develop system to provide any error feedback
      }
    }else{
      setTfuelValueValid(true);
      setTfuelInputVisible(true);
    }
  }
  const handleUpdateTfuelCancel=()=>{
    setTfuelValue(basket.TFuel);
    setTfuelInputVisible(false);
  }
  const handleTfuelValueChanged=(event)=>setTfuelValue(event.target.value);
  const handleUpdateActiveDeactive=async()=>{
      setIsUpdatingBasketActiveInactive(true);
      basket.IsActive = !basket.IsActive;
      const basketIdNum= toBigInt(routeParams.basketid);
      const result= await setBasketActiveInactive(defaultAccount,defaultSigner,basketIdNum,basket.IsActive);
      console.log(result);
      const saveResult=await updateActiveInactive(JSON.stringify(basket));
      if(saveResult){
        setBasketIsActive(basket.IsActive);
        setIsUpdatingBasketActiveInactive(false);
      }else{
        console.log(saveResult);
      }
  }
  const handleRemoveBasket=async()=>{
    setIsRemoving(true);
    const basketIdNum= toBigInt(routeParams.basketid);
    const result= await removeBasket(defaultAccount,defaultSigner,basketIdNum);
    if(result===routeParams.basketid){
      const saveResult= await removeBasketStore(basketIdNum);
      if(saveResult){
        setIsRemoving(false);
        //TODO:Will need to remove the basket from the modal to add basket offers.
        navigate('/');
      }
    }
  }
  const handleSetOffer= (offerKey, willShowOffer)=>{
    setOfferedBasket(basket.OffersReceived[offerKey]);
    if(willShowOffer){
      setShowOffer(true);
    }
  }
  const handleRemoveAnOffer = async(basketIdOffer, basketIdOfferOn,isUpdatingRejectOfferFlag)=>{
    let offerId=0;
    let offerRemoving=[];
    if(isUpdatingRejectOfferFlag){
      OffersReceived.forEach(((offerTested)=>{
        if(offerTested.BasketOffered==basketIdOffer){
          offerId=offerTested.OfferId;
          offerRemoving.push(true);
        }else{
          offerRemoving.push(false);
        }
      }));
      setIsRejectingOffer(offerRemoving);
      setIsUpdatingRejectOffer(true);
    }else{
      OffersMade.forEach(offer=>{
        if(offer.BasketOffered==basketIdOffer){
          offerRemoving.push(true);
          offerId = offer.OfferId;
        }else{
          offerRemoving.push(false);
        }
      });
      setIsRemovingOffer(offerRemoving);
    }
    const result = await removeOfferBasket(defaultAccount,defaultSigner,basketIdOffer,basketIdOfferOn);
    if(result==basketIdOffer){
        let saveResult= await removeBasketOffer(offerId);
        if(saveResult){     
          let newOffers=[];
          if(isUpdatingRejectOfferFlag){
            OffersReceived.forEach(((offerTested)=>{
              if(offerTested.BasketOffered!=basketIdOffer){
                newOffers.push(offerTested);
              }
            }));
            setOffersReceived(newOffers);
          }else{
            OffersMade.forEach((y)=>{
              if(y.OfferId!=offerId){
                newOffers.push(y);
              }
            });
            setOffersMade(newOffers);
          }
        }
    }
    let doneOfferRemoving=[];
    if(!isUpdatingRejectOfferFlag){
      OffersReceived.forEach((()=>{
        doneOfferRemoving.push(false);
      }));
      setIsRejectingOffer(doneOfferRemoving);
    }else{
      OffersMade.forEach(()=>{
        doneOfferRemoving.push(false);
      });
      setIsRemovingOffer(doneOfferRemoving);
      setShowOffer(false);
    }
  }
  const handleAcceptOffer= async(offer)=>{
    let acceptOffersUpdating=[];
    OffersReceived.forEach((offerTested)=>{
      if(offerTested.offerId==offer.BasketOffered.offerId){
        acceptOffersUpdating.push(true);
      }else{
        acceptOffersUpdating.push(false);
      }
    });
    setIsUpdatingAcceptOffers(acceptOffersUpdating); 
    setIsUpdatingAcceptOffer(true);

    const result= await acceptBasketOffer(defaultAccount,defaultSigner,offer.BasketOffered,offer.BasketOfferedOn);
    if(result==offer.BasketOffered.BasketId){
      console.log(result); //TODO:This is a check for success. If it works move conditional success code in this block.
    }
    offer.Accepted=true;
    const saveResult=await updateOfferAccepted(JSON.stringify(offer));
    if(saveResult){
      //Move accept offer modal over. Will probably want it to navigate to main page on close. 
      setopenOfferAcceptedModal(true);  
    }
    let acceptOffersUpdatingFinish=[];
    OffersReceived.forEach(()=>{
      acceptOffersUpdatingFinish.push(false);
    });
    setIsUpdatingAcceptOffers(acceptOffersUpdatingFinish); 
    setIsUpdatingAcceptOffer(false);
  }
  const closeOfferAcceptedModal=()=>{
    setopenOfferAcceptedModal(false);
    navigate("/");
  }
  const handleMakeAnOffer=(basketId, basketName)=>{
    setOfferBasketId(basketId);
    setOfferBasketName(basketName);
    setopenOfferBasketList(true);
  }
  const handleShowMoreClick= async ()=>{
      const addToTotal= (nftsInWallet.length>nftsToShowInWallet.length+10?nftsToShowInWallet.length+10:nftsInWallet.length);
      let i=nftsToShowInWallet.length-1;
      let tokenURIs=nftsToShowInWallet;
      for(i;i<addToTotal;i++){
        const metaData = await getTokenURI(nftsInWallet[i].Address,nftsInWallet[i].TokenId);
        const res= await fetch(metaData);
        const resText= await res.text(); 
        try{
         const resJSON = JSON.parse(resText);
         nftsInWallet[i].Name=resJSON.name;
         nftsInWallet[i].ImageURL=resJSON.image;
 
        }catch(ex){
         console.log("NFT metadata is not valid JSON.");
        }
        tokenURIs.push(nftsInWallet[i]);
       }
       setNFTsToShowInWallet(tokenURIs);
       setHideShowViewMoreNFTs(nftsInWallet.length>tokenURIs.length);
    }
    const showHideOffers=()=>{
      if(showBasketOffers){
        setShowBasketOffers(false)
      }else{
        setShowBasketOffers(true);
      }
    }
    const showHideOffersMade=()=>{
      if(showOffersMade){
        setShowOffersMade(false)
      }else{
        setShowOffersMade(true);
      }
    }
  return (
      <>
         {isLoading?
              <Center>
                 <Spinner thickness='4px' size='xl' color='primary.400' />
              </Center>
              :
              <Grid templateColumns={'1fr'}  my='10px' gap='18px'>
                  <Card padding={'10px'} border={'2px solid'} borderColor="primary.500">
                      <CardHeader>
                        <HStack display={{ base: "block", lg: "flex" }}>
                          {basket.Owner==defaultAccount?
                            <>
                              <Heading color="primary.500" mb={4} mr={4}>{BasketName}</Heading>
                                {BasketIsActive?
                                  <Button 
                                    onClick={()=>{handleUpdateActiveDeactive()}} 
                                    isLoading={isUpdatingBasketActiveInactive}
                                    loadingText="Updating..." 
                                    mb={2} mr={4} 
                                    variant='secondary'>
                                      Remove Allow Offers
                                  </Button>:
                                  <Button 
                                    onClick={()=>{handleUpdateActiveDeactive()}} 
                                    isLoading={isUpdatingBasketActiveInactive}
                                    loadingText="Updating..." 
                                    mb={2} mr={4} 
                                    variant='main'>
                                      Allow Offers
                                  </Button>}
                                  <Button 
                                    color="primary.300" mb={2} 
                                    loadingText="Removing..."
                                    isLoading={isRemoving}
                                    onClick={()=>{handleRemoveBasket()}} 
                                    leftIcon={<DeleteIcon />} >
                                    Remove
                                  </Button>
                            </>
                            :
                                <>
                                  <Heading color="primary.500" mb={4} mr={4}>{BasketName}</Heading>
                                  <Button 
                                    color="primary.300" mb={2} 
                                    onClick={()=>{handleMakeAnOffer(basket.BasketId, BasketName)}}
                                    >
                                      Make An Offer
                                  </Button>
                                </>
                              
                          }
                          <Box fontSize="2xl" fontWeight="extrabold" mr={1} ml={{ base: "0", lg: "10" }}
                          mt= {{ base: "5", lg: "0" }}>
                                    TFUEL:
                                </Box>
                                {tfuelInputVisible?<></>:
                                    <Text display="inline" verticalAlign="middle" mr={2} fontSize="2xl">
                                      {tfuelValue}
                                    </Text>
                                }
                                {tfuelInputVisible?
                                  <Input width="120px" 
                                    type='number' 
                                    maxLength='9'
                                    onChange={handleTfuelValueChanged} 
                                    isInvalid={!tfuelValueValid}
                                    value={tfuelValue} 
                                    focusBorderColor='primary.500'
                                    errorBorderColor='red.300' />
                                  :<></>}
                                <Image mr={4} display="inline" width="30px" verticalAlign="middle" src={tfuelLogo} /> 
                                {tfuelInputVisible?<IconButton color="primary.500" mr={3} onClick={()=>{handleUpdateTfuelCancel()}} icon={<CloseIcon />}  />:<></>}
                                {basket.Owner==defaultAccount?
                                  (BasketIsActive && OffersReceived.length>0)?
                                  <b>Cannot add/remove Tfuel from an active basket with offers. Reject all offers, in order to edit.</b>:
                                  <Button variant='main' 
                                    onClick={()=>{handleUpdateTfuel()}} 
                                    isLoading={isUpdatingTfuel}
                                    loadingText="Updating..."> 
                                    {tfuelInputVisible?"Update" : "Add/Remove Tfuel"}
                                  </Button>:<></>
                                }
                                {basket.Owner==defaultAccount? 
                                  <Box>
                                    {ethers.formatEther(defaultBalance)} available.
                                  </Box>:<></>
                                }
                        </HStack>
                      </CardHeader>
                      <CardBody>
                        {
                          nftsInBasket.length==0?
                          <Box mt={2} fontSize="xl" fontWeight="extrabold">You have no NFTs in this basket. Add some from your wallet below.</Box>:
                          <Box mt={2}>
                            <Box fontSize="2xl" fontWeight="extrabold" mr={1}>
                                NFTs:
                            </Box>
                            <SimpleGrid minChildWidth="200px" spacing="25px">
                              {nftsInBasket.map((basketNFT,id)=>(
                                <Box key={id} 
                                maxW='sm' 
                                  borderWidth='1px' 
                                  borderRadius='lg' 
                                  borderColor='primary.500' 
                                  p={2}
                                  
                                  overflow='hidden' 
                                  height='285px'>
                                    <Center>
                                        <Image src={basketNFT.ImageURL} alt='NFT Image' height='200px' />
                                    </Center>
                                    <Center>
                                        {basketNFT.Name} #{basketNFT.TokenId}
                                    </Center>
                                    {basket.Owner==defaultAccount?
                                      <Center>
                                          {(BasketIsActive && OffersReceived.length>0)?
                                            <Center>
                                              <b>Cannot remove NFT from an active basket with offers. Reject all offers, in order to remove. </b>
                                            </Center>
                                            :
                                            <Button variant='secondary' 
                                                isLoading={basketNFT.Name+basketNFT.TokenId.toString()+"_basket"==isLoadingBasketNFT}
                                                loadingText="Removing NFT..."
                                                onClick={()=>{removeNFT(basketNFT)}}
                                              >
                                              Remove
                                            </Button>
                                          }
                                      </Center>:<></> 
                                    }
                                </Box>
                              ))}
                            </SimpleGrid>
                          </Box>
                        }
                      </CardBody>
                  </Card>
                  <Card padding={'10px'} border={'2px solid'} borderColor="primary.500">
                      <CardHeader>
                          <HStack>
                            <Heading  lineHeight="1" verticalAlign="middle" padding="0" color="primary.500" mr={4}>Basket Offers</Heading>
                            <IconButton color="primary.500" 
                              icon={showBasketOffers?<MinusIcon />:<AddIcon />} 
                              size="lg" onClick={()=>showHideOffers()} />
                          </HStack>
                      </CardHeader>
                     {showBasketOffers? <CardBody>
                      <VStack 
                          spacing={1}
                          align='stretch'>
                            {OffersReceived.length==0? 
                            <>
                              <Center>
                                  <Box fontSize="2xl" fontWeight="extrabold" ml={3}>
                                        No Offers On This Basket
                                  </Box>
                              </Center>
                            </>
                            : ShowOffer?
                            <VStack spacing={1}
                            align='stretch'>
                              <HStack>
                                  <Button 
                                    onClick={()=>{setShowOffer(false)}}
                                    variant="main"  mb={2}  
                                    leftIcon={<ArrowBackIcon />} >
                                    Return
                                  </Button>
                                  <Box fontSize="2xl" fontWeight="extrabold" ml={3}>
                                      Offer For Your Basket: {BasketName}
                                  </Box>
                              </HStack>
                              <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                              <Flex>
                                <Box>
                                  <Box fontSize="xl" fontWeight="bold" > 
                                    {offeredBasket.BasketOfferedName}
                                    <Button border="1px"
                                        ml="3"
                                        borderColor="white"
                                        alignSelf="center" 
                                        variant='secondary'
                                        onClick={()=>{
                                          hasMounted.current = false;
                                          navigate('/basket-detail/'+offeredBasket.BasketOffered);
                                        }}>
                                        View
                                    </Button>
                                  </Box>
                                  <Box>
                                    {offeredBasket.BasketOfferedTFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {offeredBasket.BasketOfferedTFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                                  </Box>
                                  <Box>
                                    <Container>
                                      <b>NFTS:</b>
                                    </Container>
                                    {offeredBasket.BasketOfferedNFTs.length===0?
                                    <Container>No NFTs In This Basket</Container>:
                                    offeredBasket.BasketOfferedNFTs.map((nft,innerId)=>(
                                      <Container key={innerId}>
                                        {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                                      </Container>
                                    ))}
                                  </Box>
                                </Box>
                              </Flex>
                              {basket.Owner==defaultAccount?
                                <Box mt={5}>
                                  <Button variant="main"
                                    onClick={()=>handleAcceptOffer(offeredBasket)}
                                    isLoading={isUpdatingAcceptOffer}
                                    loadingText="Updating..."
                                    mr={4} >
                                    Accept
                                  </Button>
                                  <Button 
                                    isLoading={isUpdatingRejectOffer}
                                    loadingText="Updating..."
                                    onClick={()=>{handleRemoveAnOffer(offeredBasket.BasketOffered, basket.BasketId,true)}}
                                    color="primary.300" >
                                    Reject
                                  </Button>
                                </Box>:<></>
                              }
                            </VStack>
                            :
                            OffersReceived.map((offer,offerId)=>(
                                <VStack key={offerId}
                                spacing={1}
                                align='stretch'>
                                  <Flex>
                                    <Box>
                                      <Box fontSize="xl" fontWeight="bold" >
                                       {offer.BasketOfferedName} For {basket.BasketName}
                                      </Box>
                                      <Box mt="1">
                                        <Button 
                                          mr={4} 
                                          variant="main"
                                          onClick={()=>{handleSetOffer(offerId,true)}}>
                                          See Offer
                                        </Button>
                                        {basket.Owner==defaultAccount?
                                          <Button 
                                            mr={4} 
                                            loadingText="Updating..."
                                            isLoading={isUpdatingAcceptOffers[offerId]}
                                            onClick={()=> {handleSetOffer(offerId,false);handleAcceptOffer(offer);}}
                                            variant="main">
                                            Accept Offer
                                          </Button>:<></>
                                        }
                                        {basket.Owner==defaultAccount?
                                          <Button 
                                            onClick={()=>{handleSetOffer(offerId,false);handleRemoveAnOffer(offer.BasketOffered, basket.BasketId,true)}}
                                            isLoading={isRejectingOffer[offerId]}
                                            loadingText="Updating..."
                                            color="primary.300" >
                                            Reject Offer
                                          </Button>:<></>
                                        }
                                      </Box>
                                    </Box>
                                  </Flex>
                                  <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                </VStack>
                            ))}
                        </VStack>
                      </CardBody>:<></>}
                  </Card>
                  <Card padding={'10px'} border={'2px solid'} borderColor="primary.500">
                      <CardHeader>
                          <HStack>
                            <Heading  lineHeight="1" verticalAlign="middle" padding="0" color="primary.500" mr={4}>Offers Made</Heading>
                            <IconButton color="primary.500" 
                              icon={showOffersMade?<MinusIcon />:<AddIcon />} 
                              size="lg" onClick={()=>showHideOffersMade()} />
                          </HStack>
                      </CardHeader>
                      {showOffersMade?
                      <CardBody>
                        {OffersMade.length===0?
                          <>
                            <Center>
                                <Box fontSize="2xl" fontWeight="extrabold" ml={3}>
                                      No Offers Made By This Basket
                                </Box>
                            </Center>
                          </>:
                          <>
                            {OffersMade.map((offer,id)=>(
                                <VStack key={id}
                                  spacing={1}
                                  align='stretch'>
                                  <Flex>
                                    <Box>
                                      <Box fontSize="xl" fontWeight="bold">
                                        {offer.BasketOfferedOnName}
                                      </Box>
                                      <Box>
                                        {offer.BasketOfferedOnTFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {offer.BasketOfferedOnTFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                                      </Box>
                                      <Box mt="1">
                                        <Container>
                                          <b>NFTS:</b>
                                        </Container>
                                        {offer.BasketOfferedOnNFTs.length===0?
                                        <Container>No NFTs In This Basket</Container>:
                                          offer.BasketOfferedOnNFTs.map((nft,innerId)=>(
                                          <Container key={innerId}>
                                            {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                                          </Container>
                                        ))}
                                      </Box>
                                      <Box mt="1" >
                                          {offer.OfferedOwner==defaultAccount?
                                            <Button variant="main"
                                            isLoading={isRemovingOffer[id]}
                                            loadingText="Updating..."
                                            onClick={()=>{handleRemoveAnOffer(offer.BasketOffered, offer.BasketOfferedOn,false)}}
                                            >
                                              Remove Offer
                                            </Button>:
                                            <Button border="1px"
                                                ml="3"
                                                borderColor="white"
                                                alignSelf="center" 
                                                variant='secondary'
                                                onClick={()=>{
                                                  hasMounted.current = false;
                                                  navigate('/basket-detail/'+offer.BasketOfferedOn);
                                                }}>
                                                View
                                            </Button>}
                                      </Box>
                                    </Box>
                                  </Flex>
                                  <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                </VStack>
                              ))}
                          </>}
                      </CardBody>:<></>}
                  </Card>
                  {basket.Owner==defaultAccount?
                    <Card padding={'10px'} border={'2px solid'} borderColor="primary.500">
                          <CardHeader>
                              <Heading color="primary.500" mb={4} mr={4}>NFTs In Your Wallet</Heading>
                          </CardHeader>
                          <CardBody>
                            {
                              nftsToShowInWallet.length==0?
                              <Center>
                                <VStack>
                                  <Box fontSize="xl" fontWeight="bold">You have no NFTs in your wallet. Buy some!!!</Box>
                                  <Box>
                                    <Link href='https://www.thetadrop.com/' isExternal mr={2} >ThetaDrop</Link>
                                    <Link href='https://opentheta.io/' isExternal mr={2} >OpenTheta</Link>
                                    <Link href='https://www.thetararity.com/' isExternal>ThetaRarity</Link>
                                  </Box>
                                </VStack>
                              </Center>
                              :
                              <Box>
                                <SimpleGrid minChildWidth="200px" spacing="25px">
                                  {nftsToShowInWallet.map((walletNFT,id)=>(
                                    <Box key={id}  
                                      maxW='sm' 
                                      borderWidth='1px' 
                                      borderRadius='lg' 
                                      borderColor='primary.500' 
                                      p={2}
                                      overflow='hidden' 
                                      height='285px'>
                                        <Center>
                                            <Image src={walletNFT.ImageURL} alt='NFT Image' height='200px' />
                                        </Center>
                                        <Center>
                                            {walletNFT.Name} #{walletNFT.TokenId}
                                        </Center>
                                        <Center>
                                          {(BasketIsActive && OffersReceived.length>0)?
                                            <Center>
                                              <b>Cannot add to an active basket with offers. Reject all offers, in order to add. </b>
                                            </Center>
                                            :
                                            <Button variant='secondary' 
                                              isLoading={walletNFT.Name+walletNFT.TokenId.toString() + "_wallet" == isLoadingWallet}
                                              loadingText="Adding NFT..."
                                              onClick={()=>{addNFT(walletNFT)}} >
                                                Add To Basket
                                            </Button>
                                          }
                                        </Center>
                                    </Box>
                                  ))}
                                </SimpleGrid>
                                {hideShowViewMoreNFTs? 
                                <Center mt="3">
                                  <Button variant='main' onClick={handleShowMoreClick} >Show More</Button>
                                </Center>:<></>}
                              </Box>
                            }
                          </CardBody>
                    </Card>:<></>
                  }
              </Grid>
          }
          <Modal isOpen={openOfferAcceptedModal}
            onClose={closeOfferAcceptedModal}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Transaction Complete</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Divider borderColor="primary.500" mb="3" mt="3" ></Divider>
                {offeredBasket===null?<></>:
                  <VStack spacing={1}
                    mb={5}
                    align='stretch'>
                    <HStack>
                      <Box fontSize="xl" fontWeight="extrabold" >
                        For Your Basket:<br /> {BasketName}
                      </Box>
                    </HStack>
                    <Divider borderColor="primary.500" mb="3" mt="3" ></Divider>
                    <Flex>
                      <Box>
                        <Box fontWeight="bold" > 
                          Your Recieved:
                        </Box>
                        <Box>
                          {offeredBasket.BasketOfferedTFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {offeredBasket.BasketOfferedTFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                        </Box>
                        <Box>
                          <Container>
                            <b>NFTS:</b>
                          </Container>
                          {offeredBasket.BasketOfferedNFTs.length===0?
                          <Container>No NFTs In This Basket</Container>:
                          offeredBasket.BasketOfferedNFTs.map((nft,innerId)=>(
                            <Container key={innerId}>
                              {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                            </Container>
                          ))}
                        </Box>
                        <Box fontWeight="bold" mt={4}>
                          You Sent:
                        </Box>
                        <Box>
                          {basket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {basket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                        </Box>
                        <Box>
                          <Container>
                            <b>NFTS:</b>
                          </Container>
                          {basket.NftsInBasket.length===0?
                          <Container>No NFTs In This Basket</Container>:
                          basket.NftsInBasket.map((nft,innerId)=>(
                            <Container key={innerId}>
                              {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                            </Container>
                          ))}
                        </Box>
                      </Box>
                    </Flex>
                  </VStack>
                }
              </ModalBody>
            </ModalContent>
          </Modal>
      </>
  )
}
export default BasketDetail