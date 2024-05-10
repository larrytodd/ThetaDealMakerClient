import tfuelLogo from '../assets/theta-fuel-tfuel-logo.svg';
import headerImage from '../assets/theworld_header.jpeg';
import {useDisclosure, Alert, AlertIcon, AlertDescription, AlertTitle, CloseButton, Card, CardHeader,CardBody,Heading, Grid, GridItem, Center,Text,Box,Button, VStack, HStack, Flex, Divider,Container, Image,Spinner, Spacer, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody } from "@chakra-ui/react"
import { ArrowBackIcon } from '@chakra-ui/icons';
import {Contexts} from '../utils/contexts'
import { useEffect, useContext, useState } from "react"
import { getBasketsByOwner,getBasketsByRecency,updateActiveInactive, removeBasketOffer, updateOfferAccepted } from "../shared/dbstore";
import {connectWallet, setBasketActiveInactive, removeOfferBasket, acceptBasketOffer} from '../shared/transactions'
import {  toBigInt } from 'ethers';
import { useNavigate } from "react-router-dom";
function Index({reloadBasket}){
  const {defaultAccount,setDefaultAccount}= useContext(Contexts);
  const {defaultSigner, setDefaultSigner}= useContext(Contexts);
  const {setopenOfferBasketList}=useContext(Contexts);
  const {setOfferBasketId}=useContext(Contexts);
  const {setOfferBasketName}= useContext(Contexts);
  const {ownedBaskets,setownedBaskets}=useContext(Contexts);
  const {setDefaultBalance}=useContext(Contexts);
  const [openOfferAcceptedModal,setopenOfferAcceptedModal]=useState(false);
  const [isLoading,setIsLoading]=useState(true);
  const [isUpdatingBasketActiveInactive, setIsUpdatingBasketActiveInactive]=useState([]);
  const [isUpdatingAcceptOffer,setIsUpdatingAcceptOffer]=useState(false);
  const [isUpdatingRejectOffer,setIsUpdatingRejectOffer]=useState(false);
  const [errorMessage, setErrorMessage]= useState(null);
  const [recentBaskets,setrecentBaskets]=useState(null);
  const [BasketIsActive,setBasketIsActive]=useState([]);
  const [ShowOffersMade,setShowOffersMade]=useState(false);
  const [ShowOffer, setShowOffer]=useState(false);
  const [OffersMade,setOffersMade]=useState([]);
  const [OffersMadeName, setOffersMadeName]=useState("");
  const [isRemovingOffer, setIsRemovingOffer]=useState([]);
  const [offeredBasket,setOfferedBasket]=useState(null);
  const [offeredOnBasket,setOfferedOnBasket]=useState(null);
  const [currentOfferId,setCurrentOfferId]=useState(-1);
  const [currentOfferRejectId,setCurrentOfferRejectId]=useState(-1);
  const {isOpen: isVisible,onClose} = useDisclosure({ defaultIsOpen: true })
  const navigate= useNavigate();
  useEffect(()=>{
    if(defaultAccount!==null){
      setIsLoading(true);
      getBasketsByOwner(defaultAccount).
      then(data=>{
        let basketsActiveInactive=[];
        let basketIsUpdating=[];
        data.forEach(basket => {
          basketsActiveInactive.push(basket.IsActive);
          basketIsUpdating.push(false);
        });
        setBasketIsActive(basketsActiveInactive);
        setIsUpdatingBasketActiveInactive(basketIsUpdating);
        setownedBaskets(data);
        setIsLoading(false);
      });
    }
  },[defaultAccount,reloadBasket]);
  useEffect(()=>{
    getBasketsByRecency(0,6,true).
      then(data=>{
        setrecentBaskets(data);
        setIsLoading(false);
      });
  },[reloadBasket])
  const handleWalletConnectClick= async()=>{
    await connectWallet().then(async (result)=>{
      if(result.address && result.signer){
        setDefaultAccount(result.address);
        setDefaultSigner(result.signer);
        setDefaultBalance(result.balance);
      }else{
        setErrorMessage("Install Metamask");
      }
    });
  }
  const handleUpdateActiveDeactive=async(basket,key)=>{
    let basketIsUpdating=[];
    ownedBaskets.forEach(basketIterate => {
      if(basket.BasketId==basketIterate.BasketId)  
        basketIsUpdating.push(true);
      else{
        basketIsUpdating.push(false);
      }
    });
    setIsUpdatingBasketActiveInactive(basketIsUpdating);
    
    basket.IsActive = !basket.IsActive;
    const basketIdNum= toBigInt(basket.BasketId);
    const result= await setBasketActiveInactive(defaultAccount,defaultSigner,basketIdNum,basket.IsActive);
    console.log(result);
    const saveResult=await updateActiveInactive(JSON.stringify(basket));
    if(saveResult){
      let newBasketIsActive=BasketIsActive;
      newBasketIsActive[key]=basket.IsActive;
      setBasketIsActive(newBasketIsActive);

      let basketDoneUpdating=[];
      ownedBaskets.forEach(() => {
        basketDoneUpdating.push(false);
      });
      setIsUpdatingBasketActiveInactive(basketDoneUpdating);
    }else{
      console.log(saveResult);
    }
}
const handleMakeAnOffer=(basketId, basketName)=>{
  setOfferBasketId(basketId);
  setOfferBasketName(basketName);
  setopenOfferBasketList(true);
}
const handleOffersMade=(keySelected,nameSelected)=>{
  let offerRemoving=[];
  ownedBaskets[keySelected].OffersMade.forEach(()=>{
    offerRemoving.push(false);
  });
  setIsRemovingOffer(offerRemoving);
  setOffersMade(ownedBaskets[keySelected].OffersMade);
  setOffersMadeName(nameSelected);
  setShowOffersMade(true);
}
const handleRemoveAnOffer = async(offerId,basketIdOffer, basketIdOfferOn,isUpdatingRejectOfferFlag)=>{
  setCurrentOfferRejectId(offerId);
 
  setIsUpdatingRejectOffer(isUpdatingRejectOfferFlag);

  const result = await removeOfferBasket(defaultAccount,defaultSigner,basketIdOffer,basketIdOfferOn);
  if(result==basketIdOffer){
      let saveResult= await removeBasketOffer(offerId);
      if(saveResult){     
        let newOwnedBaskets= [];
        ownedBaskets.forEach((x)=>{
          if((x.BasketId==basketIdOffer && !isUpdatingRejectOfferFlag) ||(x.BasketId==basketIdOfferOn && isUpdatingRejectOfferFlag)){
            let newOffers=[];
            if(isUpdatingRejectOfferFlag){
              x.OffersReceived.forEach((y)=>{
                if(y.OfferId!=offerId){
                  newOffers.push(x);
                }
              });
              x.OffersReceived=newOffers;
            }else{
              x.OffersMade.forEach((y)=>{
                if(y.OfferId!=offerId){
                  newOffers.push(y);
                }
              });
              x.OffersMade=newOffers;
              setOffersMade(newOffers);
            }
            newOwnedBaskets.push(x);
          }else{
            newOwnedBaskets.push(x);
          } 
        });
        setownedBaskets(newOwnedBaskets);
        setCurrentOfferRejectId(-1)
      }
  }
  if(isUpdatingRejectOfferFlag){
    setShowOffer(false);
  }
}
const handleSetOffer= (basketKey,offerKey, willShowOffer)=>{
  setOfferedOnBasket(ownedBaskets[basketKey]);
  setOfferedBasket(ownedBaskets[basketKey].OffersReceived[offerKey]);
  if(willShowOffer){
    setShowOffer(true);
  }
}
const handleAcceptOffer= async(offer)=>{
  setIsUpdatingAcceptOffer(true);
  setCurrentOfferId(offer.OfferId);
  const result= await acceptBasketOffer(defaultAccount,defaultSigner,offer.BasketOffered,offer.BasketOfferedOn);
  
  if(result==offer.BasketOffered && result!==undefined){
    offer.Accepted=true;
    const saveResult=await updateOfferAccepted(JSON.stringify(offer));
    if(saveResult){
      setShowOffer(false);

      let newOwnedBaskets= [];
      ownedBaskets.forEach((basket)=>{
        if(basket.BasketId!=offer.BasketOfferedOn){
          newOwnedBaskets.push(basket);
        }
        let newRecentBaskets=[];
        recentBaskets.forEach((basket)=>{
          if(basket.BasketId!=offer.BasketOfferedOn && basket.BasketId!= offer.BasketOffered){
            newRecentBaskets.push(basket);
          }
        });
        setownedBaskets(newOwnedBaskets);
        setrecentBaskets(newRecentBaskets);
        setIsUpdatingAcceptOffer(false);
        setopenOfferAcceptedModal(true); 
        setCurrentOfferId(-1);
      });     
    }
  }
}
const closeOfferAcceptedModal=()=>{
  setopenOfferAcceptedModal(false);
}
  return (
    <>
      {isLoading ?
          <Center>
          <Spinner thickness='4px' size='xl' color='primary.400' />
        </Center>
        :
        (defaultAccount===null)?
          <>
            {isVisible?
              <Center>
                  <Alert status='error' mb="3" maxWidth="1041px">
                    <AlertIcon />
                      <Box>
                        <AlertTitle>In Testnet</AlertTitle>
                        <AlertDescription>
                          Theta Deal Maker is presently using a smart contract on Theta Testnet. Please do not attempt any transactions from a Mainnet wallet.
                        </AlertDescription>
                      </Box>
                      <CloseButton
                        alignSelf='flex-start'
                        position='relative'
                        right={-1}
                        top={-1}
                        onClick={onClose}
                      />
                  </Alert>
              </Center>
              :<></>
            }
            <Center>
              <Image borderRadius="12px"  src={headerImage} />
            </Center>
            <Center mt="5">
              <Heading as="h1" textAlign="center">
                  Structure NFTs and TFUEL into tradeable assets. Strike deals with others. <Text as="span" color="primary.100">Derive value from what you own.</Text>
              </Heading>
            </Center> 
            <Center>
              <Box mt="5" mb="2" fontSize="2xl">
                  Connect your wallet to get started.
              </Box>
            </Center>
            <Center>
              <Button variant='main' onClick={handleWalletConnectClick} >Connect</Button>
            </Center>
            <Center>
              <Box>
                {errorMessage}
              </Box>
            </Center>
            <Card mt="28" border={'2px solid'} borderColor="primary.500"  maxH={["fit-content","2000px","2000px"]} overflowY="auto" >
                <CardHeader>
                    <Heading color="primary.500" mb={4} mr={4}>Latest Baskets</Heading>
                </CardHeader>
                <CardBody>
                <Divider borderColor="primary.500" mb="5" ></Divider>
                  {recentBaskets===null?<></>: 
                  recentBaskets.map((recentBasket,id)=>(
                    <VStack key={id}
                      spacing={1}
                      align='stretch'>
                      <Box fontSize="xl" fontWeight="bold">
                        {recentBasket.BasketName}
                      </Box>
                      <Flex>
                        <Box>
                          <Box>
                            {recentBasket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {recentBasket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                          </Box>
                          <Box mt="1">
                            <Container>
                              <b>NFTS:</b>
                            </Container>
                            {recentBasket.NftsInBasket.length===0?
                            <Container>No NFTs In This Basket</Container>:
                            recentBasket.NftsInBasket.map((nft,innerId)=>(
                              <Container key={innerId}>
                                {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                              </Container>
                            ))}
                          </Box>
                        </Box>
                        <Spacer />
                        <Button border="1px"
                                borderColor="white"
                                alignSelf="center"
                                onClick={handleWalletConnectClick} 
                          variant='secondary'>
                            Connect Wallet
                        </Button>
                      </Flex>
                      <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                    </VStack>
                  ))}
                </CardBody>
              </Card>
          </>
         :
          <Grid templateColumns="repeat(2,1fr)"gap='24px' mb='24px'>
            <GridItem colSpan={{base:2, lg:1}} >
                <Card border={'2px solid'} borderColor="primary.500" minH={["500px"]} maxH={{base:"fit-content",lg:"500px"}}  overflowY="auto">
                  <CardHeader>
                      <Heading color="primary.500" mb={4} mr={4}>My Baskets</Heading>
                  </CardHeader>
                  <CardBody>
                      <Divider borderColor="primary.500" mb="5" ></Divider>
                      {ownedBaskets===null?<></>:
                        ShowOffersMade? 
                        <>
                          <HStack display={{ base: "block", md: "flex" }}>
                              <Button 
                                onClick={()=>{setShowOffersMade(false)}}
                                variant="main" 
                                mb={2}  
                                leftIcon={<ArrowBackIcon />} >
                                Return
                              </Button>
                              <Box fontSize="2xl" fontWeight="extrabold" ml={3}>
                                  Offers Made By {OffersMadeName}
                              </Box>
                          </HStack>
                          <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                          {OffersMade.length===0?
                          <>
                            <Center>
                                <Box fontSize="2xl" fontWeight="extrabold" ml={3}>
                                      No Offers On This Basket
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
                                          <Button variant="main"
                                           isLoading={isRemovingOffer[id]}
                                           loadingText="Updating..."
                                           onClick={()=>{handleRemoveAnOffer(offer.OfferId,offer.BasketOffered, offer.BasketOfferedOn,false)}}
                                          >
                                            Remove Offer
                                          </Button>
                                           <Button border="1px"
                                              ml="3"
                                              borderColor="white"
                                              alignSelf="center" 
                                              variant='secondary'
                                              onClick={()=>{
                                                navigate('/basket-detail/'+offer.BasketOfferedOn);
                                              }}>
                                              View
                                          </Button>
                                      </Box>
                                    </Box>
                                  </Flex>
                                  <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                </VStack>
                              ))}
                          </>} 
                        </>
                          :
                          ownedBaskets.map((basket,id)=>(
                            <VStack key={id}
                            spacing={1}
                            align='stretch'>
                                <Flex>
                                  <Box>
                                    <Box fontSize="xl" fontWeight="bold">
                                      {basket.BasketName}
                                    </Box>
                                    <Box>
                                      {basket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {basket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                                    </Box>
                                    <Box mt="1">
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
                                    <Box mt="1" >
                                        {(BasketIsActive.length>=(id+1)?BasketIsActive[id]:false)?
                                          <Button 
                                            onClick={()=>{handleUpdateActiveDeactive(basket,id)}} 
                                            isLoading={isUpdatingBasketActiveInactive[id]}
                                            loadingText="Updating..." 
                                            display={{ base: "block", md: "inline-flex" }}
                                            mr={4} 
                                            variant='main'>
                                              Remove Allow Offers
                                          </Button>:
                                          <Button 
                                            onClick={()=>{handleUpdateActiveDeactive(basket,id)}} 
                                            isLoading={isUpdatingBasketActiveInactive[id]}
                                            loadingText="Updating..." 
                                            display={{ base: "block", md: "inline-flex" }}
                                            mr={4} 
                                            variant='main'>
                                              Allow Offers
                                          </Button>
                                        }
                                        <Button variant="main"
                                        mr={4}
                                        mt={{ base: "2", md: "0" }}
                                        display={{ base: "block", md: "inline-flex" }} 
                                        onClick={()=>{handleOffersMade(id,basket.BasketName)}}>
                                          Offers Made
                                        </Button>
                                        <Button onClick={()=>{
                                            navigate('/basket-detail/'+basket.BasketId);
                                          }} 
                                          display={{ base: "block", md: "inline-flex" }}  
                                          mt={{ base: "2", md: "0" }}
                                          variant="main">
                                            Edit
                                        </Button>
                                    </Box>
                                  </Box>
                                </Flex>
                                <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                            </VStack>))
                      }
                  </CardBody>
                </Card>
            </GridItem>
            <GridItem colSpan={{base:2, lg:1}} >
                <Card border={'2px solid'} borderColor="primary.500" minH={["500px"]} maxH={{base:"fit-content",lg:"500px"}} overflowY="auto" >
                  <CardHeader>
                      <Heading color="primary.500" mb={4} mr={4}>My Offers</Heading>
                  </CardHeader>
                  <CardBody>
                  <Divider borderColor="primary.500" mb="5" ></Divider>
                      {ownedBaskets===null?<></>: ShowOffer?
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
                                  Offer For Your Basket: <br />{offeredOnBasket.BasketName}
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
                              <Box fontWeight="bold" mt={4} mb={4}>
                                For
                              </Box>
                              <Box fontSize="xl" fontWeight="bold" >
                                {offeredOnBasket.BasketName}
                                <Button border="1px"
                                    ml="3"
                                    borderColor="white"
                                    alignSelf="center" 
                                    variant='secondary'
                                    onClick={()=>{
                                      navigate('/basket-detail/'+offeredOnBasket.BasketId);
                                    }}>
                                    View
                                </Button>
                              </Box>
                              <Box>
                                {offeredOnBasket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {offeredOnBasket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                              </Box>
                              <Box>
                                <Container>
                                  <b>NFTS:</b>
                                </Container>
                                {offeredOnBasket.NftsInBasket.length===0?
                                <Container>No NFTs In This Basket</Container>:
                                offeredOnBasket.NftsInBasket.map((nft,innerId)=>(
                                  <Container key={innerId}>
                                    {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                                  </Container>
                                ))}
                              </Box>
                            </Box>
                          </Flex>
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
                              onClick={()=>{handleRemoveAnOffer(offeredBasket.OfferId,offeredBasket.BasketOffered, offeredOnBasket.BasketId,true)}}
                              color="primary.300" >
                              Reject
                            </Button>
                          </Box>
                        </VStack>
                        :
                        ownedBaskets.map((basket,id)=>(
                          <VStack key={id}
                            spacing={1}
                            align='stretch'>
                              {basket.OffersReceived.map((offer,offerId)=>(
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
                                            onClick={()=>{handleSetOffer(id, offerId,true)}}>
                                            See Offer
                                          </Button>
                                          <Button
                                            mr={4}
                                            loadingText="Updating..."
                                            isLoading={offer.OfferId==currentOfferId}
                                            variant="main"
                                            onClick={()=> {handleSetOffer(id,offerId,false);handleAcceptOffer(offer);}}
                                          >
                                            Accept Offer
                                          </Button>
                                          <Button 
                                            onClick={()=>{handleSetOffer(id,offerId,false);handleRemoveAnOffer(offer.OfferId, offer.BasketOffered, offer.BasketOfferedOn,true)}}
                                            isLoading={offer.OfferId==currentOfferRejectId}
                                            loadingText="Updating..."
                                            color="primary.300" >
                                            Reject Offer
                                          </Button>
                                        </Box>
                                      </Box>
                                    </Flex>
                                    <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                  </VStack>
                              ))}
                          </VStack>  
                        ))
                      }
                  </CardBody>
                </Card>
            </GridItem>
            <GridItem colSpan="2">
                <Card border={'2px solid'} borderColor="primary.500"  maxH={{base:"fit-content",lg:"2000px"}}  overflowY="auto" >
                  <CardHeader>
                      <Heading color="primary.500" mb={4} mr={4}>Latest Baskets</Heading>
                  </CardHeader>
                  <CardBody>
                    <Divider borderColor="primary.500" mb="5" ></Divider>
                    {recentBaskets===null?<></>: 
                      recentBaskets.map((recentBasket,id)=>(
                        <VStack key={id}
                          spacing={1}
                          align='stretch'>
                          <Box fontSize="xl" fontWeight="bold">
                            {recentBasket.BasketName}
                          </Box>
                          <Flex>
                            <Box>
                              <Box>
                                {recentBasket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {recentBasket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                              </Box>
                              <Box mt="1">
                                <Container>
                                  <b>NFTS:</b>
                                </Container>
                                {recentBasket.NftsInBasket.length===0?
                                <Container>No NFTs In This Basket</Container>:
                                recentBasket.NftsInBasket.map((nft,innerId)=>(
                                  <Container key={innerId}>
                                    {nft.Name} <Box display="inline" ml="3">Token ID:</Box> {nft.TokenId}
                                  </Container>
                                ))}
                              </Box>
                            </Box>
                            <Spacer />
                            {recentBasket.Owner===defaultAccount?
                                <Button border="1px"
                                    borderColor="white"
                                    alignSelf="center" 
                                    variant='secondary'
                                    onClick={()=>{
                                      navigate('/basket-detail/'+recentBasket.BasketId);
                                    }}>
                                    Edit
                                </Button>:
                                <>
                                  <Button border="1px"
                                      mr="3"
                                      borderColor="white"
                                      alignSelf="center" 
                                      variant='secondary'
                                      onClick={()=>{
                                        navigate('/basket-detail/'+recentBasket.BasketId);
                                      }}>
                                      View
                                  </Button>
                                  <Button border="1px"
                                    borderColor="white"
                                    alignSelf="center" 
                                    variant='secondary'
                                    onClick={()=>{handleMakeAnOffer(recentBasket.BasketId, recentBasket.BasketName)}}>
                                    Make An Offer
                                  </Button>
                                </>
                            }
                            
                          </Flex>
                          <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                        </VStack>
                      ))}
                  </CardBody>
                </Card>
              </GridItem>
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
            {offeredOnBasket===null?<></>:
              <VStack spacing={1}
                mb={5}
                align='stretch'>
                <HStack>
                  <Box fontSize="xl" fontWeight="extrabold" >
                     For Your Basket:<br /> {offeredOnBasket.BasketName}
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
                      {offeredOnBasket.TFuel === 0 ? <></> : <Container> <b>TFUEL:</b> {offeredOnBasket.TFuel}<Image ml="1" display="inline" width="15px" src={tfuelLogo} /> </Container>}
                    </Box>
                    <Box>
                      <Container>
                        <b>NFTS:</b>
                      </Container>
                      {offeredOnBasket.NftsInBasket.length===0?
                      <Container>No NFTs In This Basket</Container>:
                      offeredOnBasket.NftsInBasket.map((nft,innerId)=>(
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
export default Index