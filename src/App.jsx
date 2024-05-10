import { ChakraProvider } from '@chakra-ui/react'
import {Contexts} from './utils/contexts'
import {useState} from 'react'
import { Layout } from './components/layout'
import {theme} from './shared/theme'
import { BrowserRouter } from 'react-router-dom'

function App() {
  const [defaultAccount, setDefaultAccount] = useState(null);
  const [defaultSigner, setDefaultSigner] = useState(null);
  const [defaultBalance, setDefaultBalance] = useState(null);
  const [walletLoaded,setIsWalletLoaded]=useState(null);
  const [ownedBaskets,setownedBaskets]=useState(null);
  const [openOfferBasketList,setopenOfferBasketList]=useState(null);
  const [offerBasketId,setOfferBasketId]=useState(null);
  const [offerBasketName,setOfferBasketName]=useState(null);
  return (
    <BrowserRouter>
       <Contexts.Provider value={{defaultAccount,setDefaultAccount,
        defaultSigner,setDefaultSigner,
        defaultBalance,setDefaultBalance,
        ownedBaskets,setownedBaskets,
        openOfferBasketList,setopenOfferBasketList,
        offerBasketId,setOfferBasketId,
        offerBasketName,setOfferBasketName,
        walletLoaded,setIsWalletLoaded}}>
        <ChakraProvider theme={theme}>
          <Layout />  
        </ChakraProvider>
      </Contexts.Provider>
    </BrowserRouter>
  )
}

export default App
