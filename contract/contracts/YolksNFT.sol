// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

import { Base64 } from "./libraries/Base64.sol";

contract YolksNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    struct NFTMetadata {
        bool isUsed;
        string nftImageUri; 
    }

    Counters.Counter private _tokenIds;
    mapping(uint => NFTMetadata) private nftMapping;
    uint private maxNft;

    event NewYolkNFTMinted(address sender, uint tokenId);
    event MaxNFTQuotaChanged(uint maxNft);
    event NFTUriSet(uint nftNumber, string nftImageUri);
    constructor() ERC721 ("YolksNFT", "YOLKS") {
        // initial maxNft is 10
        maxNft = 10;
    }

    function makeAYolkNFT(uint nftNumber) public {
        require(_tokenIds.current() < maxNft, "Already reached max NFT quota!");
        require(!nftMapping[nftNumber].isUsed, "NFT with that nftNumber is already minted");

        uint newItemId = _tokenIds.current();
        nftMapping[nftNumber].isUsed = true;
        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, nftMapping[nftNumber].nftImageUri);
    
        _tokenIds.increment();
        console.log("An NFT w/ ID %s has been minted to %s", newItemId, msg.sender);
        emit NewYolkNFTMinted(msg.sender, newItemId);
    }

    function getTotalNFTsMintedSoFar() public view returns(uint) {
      return _tokenIds.current();
    }

    function isNftMappingAlreadyUsed(uint nftNumber) public view returns(bool) {
        return nftMapping[nftNumber].isUsed;
    }

    function setMaxNft(uint _maxNft) public onlyOwner {
        maxNft = _maxNft;
        emit MaxNFTQuotaChanged(_maxNft);
    }

    function getMaxNft() public view returns(uint) {
        return maxNft;
    }

    function setNftImageUri(uint nftNumber, string memory _nftImageUri) public onlyOwner {
        nftMapping[nftNumber].nftImageUri = _nftImageUri;
        emit NFTUriSet(nftNumber, _nftImageUri);
    }
}