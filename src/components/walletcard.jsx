import {useState} from 'react';
import {ethers} from 'ethers';
import { Button } from '@chakra-ui/react'

const provider = new ethers.BrowserProvider(window.ethereum);
function WalletCard() {
    const [errorMessage, setErrorMessage]= useState(null);
    const [defaultAccount, setDefaultAccount] = useState(null);
    const [userBalance, setUserBalance] = useState(null);
    const connectwalletHandler = () => {
        if (window.ethereum) {
            provider.send("eth_requestAccounts", []).then(async () => {
                const signer= await provider.getSigner();
                await accountChangedHandler(signer);
            })
        } else {
            setErrorMessage("Please Install Metamask!!!");
        }
    }
    const accountChangedHandler = async (newAccount) => {
        const address = await newAccount.getAddress();
        setDefaultAccount(address);
        const balance = await provider.getBalance(address,"latest");
        setUserBalance(ethers.formatEther(balance));
    }
    return (
        <div className="WalletCard">
            <img src='' className="App-logo" alt="logo" />
            <h3 className="h4">
                Filler Text
            </h3>
            <Button onClick={connectwalletHandler} colorScheme='blue'>{defaultAccount ? "Connected!!" : "Connect"}</Button>
            <div className="displayAccount">
                <h4 className="walletAddress">Address:{defaultAccount}</h4>
                <div className="balanceDisplay">
                    <h3>
                        Wallet Amount: {userBalance}
                    </h3>
                </div>
            </div>
            {errorMessage}
        </div>
    )
}
export default WalletCard;