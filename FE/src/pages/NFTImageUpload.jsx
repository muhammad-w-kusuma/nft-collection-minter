import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import twitterLogo from '../assets/twitter-logo.svg';
import yolksNFT from '../utils/YolksNFT.json';
import { CHAIN_ID, CONTRACT_ADDRESS, TWITTER_HANDLE, TWITTER_LINK } from './constants';
import { UploadForm } from "../components/UploadForm";
import '../styles/App.css';
import { NFTStorageClient } from "./NFTStorage";

const NFTImageUpload = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, yolksNFT.abi, signer);
      connectedContract.on(
        "NFTUriSet",
        (nftNumber, nftImageUri) =>
          alert(`Successfully inject NFT Metadata for NFT number #${nftNumber} with ipfs://${nftImageUri}`)
      );
      connectedContract.on(
        "MaxNFTQuotaChanged",
        maxNft => alert(`Max NFT quantity changed to ${maxNft}`)
      );
      console.log("Setup event listener!");
    } catch (error) {
      console.log(error);
    }
  }

  const renderNotConnectedContainer = () => currentAccount === "" && (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  const onSubmit = async ({ nftNumber, nftImage }) => {
    try {
      const { ethereum } = window;
      const provider = new ethers.providers.Web3Provider(ethereum, "any");
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, yolksNFT.abi, signer);
      setIsLoading(true);
      console.log(nftNumber);
      const metadata = await NFTStorageClient.store({
        name: `#${nftNumber} Yolk`,
        description: 'An identity for Yolk',
        image: nftImage
      });
      const setTxn = await connectedContract.setNftImageUri(+nftNumber, metadata.url);
      await setTxn.wait();
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  }

  const renderUploadForm = () => currentAccount !== "" && <UploadForm isLoading={isLoading} onSubmit={onSubmit} />;

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
          <p className="header gradient-text">Image URI Uploader</p>
          {renderUploadForm()}
          {renderNotConnectedContainer()}
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

export default NFTImageUpload;