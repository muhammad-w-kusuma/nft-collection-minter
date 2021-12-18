import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import '../styles/App.css';
import twitterLogo from '../assets/twitter-logo.svg';
import yolksNFT from '../utils/YolksNFT.json';
import { CHAIN_ID, CONTRACT_ADDRESS, OPENSEA_LINK, TWITTER_HANDLE, TWITTER_LINK } from './constants';

const ClaimNFT = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [nftMinted, setNftMinted] = useState(0);
  const [totalNft, setTotalNft] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [nftUri, setNftUri] = useState("");
  const [isRightNetwork, setIsRightNetwork] = useState(true);
    
  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
    } else {
        console.log("We have the ethereum object", ethereum);
        let chainId = await ethereum.request({ method: 'eth_chainId' });
        console.log("Connected to chain " + chainId);
        setIsRightNetwork(chainId === CHAIN_ID);
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        await setupEventListener();
    } else {
        console.log("No authorized account found")
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      await setupEventListener();
    } catch (error) {
      console.log(error)
    }
  }

  const getRandomNumber = () => Math.floor((Math.random() * 1000000000) + 1) % 5 + 1;

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        provider.on("network", (newNetwork, oldNetwork) => {
          if (oldNetwork) {
              window.location.reload();
          }
        });
        const signer = provider.getSigner();
        // const provider = new ethers.providers.AlchemyProvider(NETWORK_NAME, API_KEY);
        // const signer = new ethers.Wallet(PRIVATE_KEY, provider);
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, yolksNFT.abi, signer);
        let nftMintedCounter = await connectedContract.getTotalNFTsMintedSoFar();
        let totalNft = await connectedContract.getMaxNft();
        setNftMinted(nftMintedCounter.toNumber());
        setTotalNft(totalNft.toNumber());
        connectedContract.on("NewYolkNFTMinted", async (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setNftUri(`https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          nftMintedCounter = await connectedContract.getTotalNFTsMintedSoFar();
          setNftMinted(nftMintedCounter.toNumber());
        });
        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        setIsLoading(true);
        const provider = new ethers.providers.Web3Provider(ethereum, "any");
        const signer = provider.getSigner(); 
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, yolksNFT.abi, signer);
        console.log("Going to pop wallet now to pay gas...")
        let randomNumber = getRandomNumber();
        let isNftMappingAlreadyUsed = await connectedContract.isNftMappingAlreadyUsed(randomNumber);
        while (isNftMappingAlreadyUsed) {
          randomNumber = getRandomNumber();
          isNftMappingAlreadyUsed = await connectedContract.isNftMappingAlreadyUsed(randomNumber);
        }
        const nftTxn = await connectedContract.makeAYolkNFT(randomNumber);
        console.log("Mining...please wait.")
        await nftTxn.wait();
        console.log(nftTxn);
        console.log(`Mined, see transaction: https://polygonscan.com/tx/${nftTxn.hash}`);
        setIsLoading(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const renderMintUI = () =>
    isLoading
      ? (<button className="cta-button-disabled connect-wallet-button" disabled>Minting NFT...</button>)
      : (<button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
        Mint NFT
      </button>);

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          {currentAccount !== "" && !isRightNetwork && (
            <div className="alert">
              <p className="alertText">You are not connected to the Polygon Mumbai Test Network!</p>
            </div>
          )}
          <p className="header gradient-text">YolksNFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your YolksNFT today.
          </p>
          <p className="footer-text">
            NFT Minted {nftMinted}/{totalNft}
          </p>
          {currentAccount === "" ? renderNotConnectedContainer() : renderMintUI()}
          <p>
            <a
            className="footer-text"
            href={OPENSEA_LINK}
            target="_blank"
            rel="noreferrer"
          >{`View NFT Collection`}</a>
          </p>
          {nftUri !== "" && (
            <p>
              <a
              className="footer-text"
              href={nftUri}
              target="_blank"
              rel="noreferrer"
            >{`See the minted NFT here`}</a>
            </p>
          )}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default ClaimNFT;