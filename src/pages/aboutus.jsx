import { Text, Card } from "@chakra-ui/react"
function AboutUs(){
    return(
        <Card padding={'25px'} border={'2px solid'} borderColor="primary.500">
            <Text lineHeight="2" fontWeight="bold">
                The goal of Theta Deal Maker is to allow crypto participants to combine and structure their assets, into tradeable instruments. 
            </Text>
            <Text lineHeight="2" mt="2" fontWeight="bold">
                The initial phase will create a marketplace, where individuals can connect their wallets and place their NFTs and TFuel, in &quot;baskets&quot;.
                From there, they will be able to decide if they will accept offers on the baskets they have created. If they do, others can offer baskets
                they have created in exchange. If not, they can still offer the basket to other baskets that are accepting offers.
            </Text>
            <Text  lineHeight="2" fontWeight="bold" >
                Theta Deal Maker could solve a major problem in the Theta community. Many people &quot;offer up&quot; their NFTs, in various places. 
                Maybe they want more Tfuel. Less of one type of NFT. More of another. Or they just want to sell their whole NFT portfolio. Theta Deal Maker 
                could facilitate easier implementation of these transaction and allow owners to unlock the value of their NFTs. Other benefits include more liquidity, transperency and price discovery.     
            </Text>
            <Text lineHeight="2" mt="2" fontWeight="bold" >
                Future iterations of Theta Deal Maker may allow users to structure their baskets, based on conditions, such as time 
                or the value of other assets etc... Ability to add other types of assets and different types of structures could also be added.
            </Text>
        </Card>
    )
}
export default AboutUs