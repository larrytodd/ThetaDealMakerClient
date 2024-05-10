import tfuelLogo from '../assets/theta-fuel-tfuel-logo.svg';
import { Spinner, Spacer, Box, Center,VStack, Button,Image, Heading, Grid, GridItem, Card, CardHeader, Container, CardBody, Flex, Divider, Input, InputGroup, InputLeftElement} from '@chakra-ui/react'
import { SearchIcon } from '@chakra-ui/icons';
import  {useContext, useEffect, useState} from 'react';
import {Contexts} from '../utils/contexts'
import { useNavigate } from "react-router-dom";
import { getBasketsByRecency,searchBaskets } from "../shared/dbstore";
import {connectWallet} from '../shared/transactions'
function Explore(){
    const {defaultAccount,setDefaultAccount}= useContext(Contexts);
    const {setDefaultSigner}= useContext(Contexts);
    const {setDefaultBalance}=useContext(Contexts);
    const [isLoading,setIsLoading]=useState(true);
    const [isLoadingBaskets,setIsLoadingBaskets]=useState(false);
    const [recentBaskets,setrecentBaskets]=useState(null);
    const {setopenOfferBasketList}=useContext(Contexts);
    const {setOfferBasketId}=useContext(Contexts);
    const {setOfferBasketName}= useContext(Contexts);
    const [errorMessage, setErrorMessage]= useState(null);
    const navigate= useNavigate();
    useEffect(()=>{
        getBasketsByRecency(0,20,true).
        then(data=>{
            setrecentBaskets(data);
            setIsLoading(false);
        });
    },[]);
    const searchChange= event =>{
        const searchValue=event.target.value;
        if(searchValue.length>1){
            setIsLoadingBaskets(true);
            searchBaskets(searchValue).
            then(data=>{
                setrecentBaskets(data);
            }).finally(setIsLoadingBaskets(false));
        }
    }
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
      const handleMakeAnOffer=(basketId, basketName)=>{
        setOfferBasketId(basketId);
        setOfferBasketName(basketName);
        setopenOfferBasketList(true);
      }
    return(
        <>
         <Box color="red">
            {errorMessage}
        </Box>
        {isLoading? 
            <Center>
                <Spinner thickness='4px' size='xl' color='primary.400' />
            </Center>
            :
            <Grid templateColumns={'1fr'}  my='10px' gap='18px'>
                <GridItem>
                    <InputGroup borderColor="primary.300" backgroundColor="white" borderRadius="50px" size="lg">
                        <InputLeftElement pointerEvents='none'>
                            <SearchIcon color='primary.300' />
                        </InputLeftElement>
                        <Input placeholder='Search' type="search"  _placeholder={{ color: 'primary.300' }}  onChange={searchChange} />
                    </InputGroup>
                </GridItem>
                <GridItem>
                    {isLoadingBaskets?
                        <Center>
                            <Spinner thickness='4px' size='xl' color='primary.400' />
                        </Center>
                        :
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
                                    {(defaultAccount===null)?
                                        <Button border="1px"
                                            borderColor="white"
                                            alignSelf="center"
                                            onClick={handleWalletConnectClick} 
                                            variant='secondary'>
                                            Connect Wallet
                                        </Button>:
                                        <>
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
                                        </>
                                    }
                                    </Flex>
                                    <Divider borderColor="primary.500" mb="5" mt="5" ></Divider>
                                </VStack>
                                ))}
                            </CardBody>
                        </Card>
                    }
                </GridItem>
            </Grid>    
        }
        </>
    )
}
export default Explore