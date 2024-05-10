import tfuelLogo from '../assets/theta-fuel-tfuel-logo.svg';
import { Text,Center, VStack, Box, Flex, Container, Image, Divider, Button, Spacer} from '@chakra-ui/react';
import {Contexts} from '../utils/contexts';
import { useEffect, useContext,useState} from "react";
import { Modal,ModalOverlay,ModalContent,ModalHeader, ModalFooter,ModalBody,ModalCloseButton  } from '@chakra-ui/react';
import {offerBasket} from '../shared/transactions';
import {storeBasketOffer } from '../shared/dbstore';

function Footer(){
    const {ownedBaskets}=useContext(Contexts);
    const {defaultAccount,defaultSigner}= useContext(Contexts);
    const {openOfferBasketList,setopenOfferBasketList}=useContext(Contexts);
    const {offerBasketId}=useContext(Contexts);
    const {offerBasketName}=useContext(Contexts);
    const [isUpdatingOffer, setIsUpdatingOffer]=useState([]);
    useEffect(()=>{
        let basketOffering=[];
        if(ownedBaskets!==null){
            ownedBaskets.forEach(()=>{
                basketOffering.push(false);
            });
            setIsUpdatingOffer(basketOffering);
        }
    },[offerBasketId,defaultAccount])
    
    
    const closeOfferBasketModal=()=>{
        setopenOfferBasketList(false);
    }
    const handleMakeAnOffer=async(basketToOffer)=>{
        let basketIsOffering=[];
        var ownedBasketIndex;
        for(var i=0;i<ownedBaskets.length;i++){
            if(basketToOffer==ownedBaskets[i].BasketId){
                basketIsOffering.push(true);
                ownedBasketIndex=i;
            }else{
                basketIsOffering.push(false);
            }
        }
        setIsUpdatingOffer(basketIsOffering);
        
        const result=await offerBasket(defaultAccount,defaultSigner,basketToOffer,offerBasketId);
        if(result===basketToOffer.toString()){
            const offerBasket= {"BasketOfferedOn":offerBasketId,"BasketOffered":basketToOffer,"Accepted":false};
            const saveResult= await storeBasketOffer(JSON.stringify(offerBasket));
            let parsedSaveResult=JSON.parse(saveResult);
            if(parsedSaveResult.Success){
                ownedBaskets[ownedBasketIndex].OffersMade.push(parsedSaveResult.Offer);
            }
        }
        let basketDoneOffering=[];
        ownedBaskets.forEach(() => {
            basketDoneOffering.push(false);
        });
        setIsUpdatingOffer(basketDoneOffering);
    }
    return(
        <>
            <Center 
                h='calc(10h)' 
                as="footer"  
                p={6}
                mt={4}  
                borderTopWidth="2px"
                borderTopStyle="solid"
                borderTopColor="primary.300">
                <Text fontSize="md">Theta Deal Maker 2024&#9400;</Text>
            </Center>
            <Modal isOpen={openOfferBasketList}
                onClose={closeOfferBasketModal}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Select a basket to offer for the basket {offerBasketName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                        {ownedBaskets==null?<></>:
                           ownedBaskets.map((basket,id)=>(
                                basket.OffersMade.filter(function(x){return x.BasketOfferedOn==offerBasketId}).length==0?
                                <VStack key={id}
                                    spacing={1}
                                    align='stretch'>
                                    <Box fontSize="xl" fontWeight="bold">
                                        {basket.BasketName}
                                    </Box>
                                    <Flex>
                                        <Box>
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
                                        </Box>
                                        <Spacer />
                                        <Button 
                                            variant='main'
                                            isLoading={isUpdatingOffer[id]}
                                            loadingText="Updating..."
                                            onClick={()=>{handleMakeAnOffer(basket.BasketId)}}>
                                            Offer
                                        </Button>
                                    </Flex>
                                    <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                </VStack>:<></>   
                            
                           )) 
                        }
                    </ModalBody>
                    <ModalFooter>

                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
export default Footer