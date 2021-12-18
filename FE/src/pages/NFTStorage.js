import { NFTStorage } from "nft.storage";
import { NFT_STORAGE_KEY } from "./constants";

export const NFTStorageClient = new NFTStorage({ token: NFT_STORAGE_KEY });