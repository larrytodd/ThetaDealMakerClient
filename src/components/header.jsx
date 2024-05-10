import logo from '../assets/thetadealmakerlogo.png';
import  {useContext, useState, useRef, useEffect} from 'react';
import {Contexts} from '../utils/contexts'
import {connectWallet,createBasket,metaMaskConnected} from '../shared/transactions'
import { storeBasket } from '../shared/dbstore';
import { Link, Box, Flex, Text, Button,  Stack,Modal,ModalOverlay,ModalContent,ModalHeader,
  ModalFooter,ModalBody,ModalCloseButton, FormControl, FormLabel, Input, useDisclosure, Image } from '@chakra-ui/react'
import { useNavigate } from "react-router-dom";

function Header({setReloadBasket}) {
  const {defaultAccount, setDefaultAccount}=useContext(Contexts);
  // eslint-disable-next-line no-unused-vars
  const {defaultSigner, setDefaultSigner}= useContext(Contexts);
  // eslint-disable-next-line no-unused-vars
  const {defaultBalance,setDefaultBalance}=useContext(Contexts);
  const {setIsWalletLoaded}=useContext(Contexts);
  const [errorMessage, setErrorMessage]= useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [basketName,setBasketName]=useState("");
  const [showBasketCreated, setShowBasketCreted]=useState(false);
  const {isOpen,onOpen, onClose } = useDisclosure()
  const [isLoading, setIsLoading] = useState(false);
  const [editBasketRouteId,setEditBasketRouteId]= useState(0);
  const initialRef = useRef(null)
  const toggle = () => setIsMenuOpen(!isMenuOpen);
  const navigate= useNavigate();
  
  useEffect(()=>{
    setIsWalletLoaded(false);
    const handleLoad= async()=>{
       await metaMaskConnected().then(async (result)=>{
          if(result.address && result.signer){
            setDefaultAccount(result.address);
            setDefaultSigner(result.signer);
            setDefaultBalance(result.balance);
          }
          setIsWalletLoaded(true);
       })
    }
    window.addEventListener("load",handleLoad);
    return ()=>{
      window.removeEventListener('load',handleLoad);
    };
  },[]);
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
  const handleCreateBasketClick=async()=>{
    setIsLoading(true);
    const basketId= await createBasket(defaultAccount,defaultSigner);
    if(basketId>0){
      const basket=JSON.stringify({BasketId:basketId,Owner:defaultAccount,BasketName:basketName});
      const saveResult= await storeBasket(basket);
      if(saveResult){
        setShowBasketCreted(true);
        setIsLoading(false); 
        setReloadBasket(true);
        setEditBasketRouteId(basketId.toString());
      }
    }else{
      setIsLoading(false); 
    }
  }
  const closeCreateBasketModal=()=>{
    onClose();
    setShowBasketCreted(false);
    setBasketName("");
  }
    return (
      <>
      <Flex  as="nav"
          align="center"
          justify="center"
          wrap="wrap"
          w="100%"
          backgroundImage="Linear-gradient(primary.500,primary.600)">
          <Flex
          align="center"
          justify="space-between"
          wrap="wrap"
          w="100%"
          maxW="container.xl"
          p={8}>
            <Box>
                <span>
                  <Link href="/">
                      <Image boxSize={{base:'50px', sm:'75x', md:'100px', lg:'131px'}}  src={logo} alt="Theta Deal Maker" />
                  </Link>
                </span>
            </Box>
            <Box display={{ base: "block", md: "none" }} onClick={toggle}>
              {isMenuOpen ?  
                  <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <title>Close</title>
                    <path
                      fill="#0b84f6"
                      d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
                    />
                  </svg> :  <svg
                              width="24px"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="#0b84f6"
                            >
                              <title>Menu</title>
                              <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                            </svg>}
            </Box>
            <Box
              display={{ base: isMenuOpen ? "block" : "none", md: "block" }}
              flexBasis={{ base: "100%", md: "auto" }}
            >
              <Stack
                spacing={8}
                align="center"
                justify={["center", "space-between", "flex-end", "flex-end"]}
                direction={["column", "row", "row", "row"]}
                pt={[4, 4, 0, 0]}
              >
                <Link href="/" style={{ textDecoration: "none" }} >
                  <Text fontSize="2xl" display="block" fontWeight='extrabold' color="primary.400">
                    {defaultAccount?"Dashboard":"Home"}
                  </Text>
                </Link>
                <Link onClick={()=>{navigate('/explore');}} style={{ textDecoration: "none" }} cursor="pointer" >
                  <Text fontSize="2xl"  display="block" fontWeight='extrabold' color="primary.400">
                    Explore
                  </Text>
                </Link>
                <Link onClick={()=>{navigate('/aboutus');}} style={{ textDecoration: "none" }} cursor="pointer"  >
                  <Text fontSize="2xl"  display="block" fontWeight='extrabold' color="primary.400" >
                    About
                  </Text>
                </Link>
                {defaultAccount? <Button variant="main" onClick={onOpen} >Create Basket</Button>:null}
                {errorMessage}
                <Button variant='main' onClick={handleWalletConnectClick} >{defaultAccount ? "Connected" : "Connect"}</Button>
              </Stack>
            </Box>
          </Flex>
        </Flex>
        <Modal
          initialFocusRef={initialRef}
          isOpen={isOpen}
          onClose={closeCreateBasketModal}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{showBasketCreated?"Basket Created":"Create A Basket"}</ModalHeader>
            {isLoading?
                <span></span>:
                <ModalCloseButton />
            }
            <ModalBody pb={6}>
              {showBasketCreated?
                  <Text>
                    Your Basket <b>{basketName}</b> has been created.
                  </Text>:
                  <FormControl>
                    <FormLabel>Basket name</FormLabel>
                    <Input ref={initialRef} placeholder='Basket name' value={basketName} onChange={(e)=>setBasketName(e.target.value)} />
                 </FormControl>
              }
            </ModalBody>
            {showBasketCreated?
              <ModalFooter> 
                <Button onClick={()=>{
                  navigate('/basket-detail/'+editBasketRouteId);
                  setShowBasketCreted(false);
                  setBasketName("")
                  closeCreateBasketModal();
                }}   variant="main"  mr={3}>
                  Edit Your Basket
                </Button>
                <Button onClick={closeCreateBasketModal}>Close</Button>
              </ModalFooter>:
              <ModalFooter> 
                <Button variant="main" 
                  onClick={handleCreateBasketClick} 
                  isLoading={isLoading}
                  loadingText="Submitting..."
                  mr={3}>
                  Create
                </Button>
                <Button isDisabled={isLoading} onClick={closeCreateBasketModal}>Cancel</Button>
              </ModalFooter>
            }
          </ModalContent>
        </Modal>
      </>
    )
}
export default Header;