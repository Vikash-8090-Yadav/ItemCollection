import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Web3Modal from 'web3modal';
import { useRouter } from 'next/router';
import Navbar from "../Component/Course/Nav";
import { marketplaceAddress } from '../config';
// const marketplaceAddress = "0x1aC5B50d6795b2fc5bA6A9Ad050eBF5590875736";

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

export default function MyAssets() {
  const [nfts, setNfts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded');
  const router = useRouter();

  useEffect(() => {
    loadNFTs();
  }, []);

  async function loadNFTs() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', [""]);
    const signer = provider.getSigner();
    const marketplaceContract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer
    );
    console.log("sign",signer);
    const data = await marketplaceContract.fetchMyNFTs("0xd6E79acae4Dd9788B647ec601E1D408bB2d27453");
    console.log(data)

    const items = await Promise.all(
      data.map(async (i) => {
        const tokenURI = await marketplaceContract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenURI);
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether');
        // if(i.owner =="")
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          tokenURI,
        };
        return item;
      })
    );
    setNfts(items);
    setLoadingState('loaded');
  }

  function listNFT(nft) {
    console.log('nft:', nft);
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }

  if (loadingState === 'loaded' && !nfts.length)
    return <h1 className="py-10 px-20  text-white text-3xl">No Courses owned</h1>;

  return (
    <div>
    <Navbar/>

    <div className="flex justify-center">

  
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {nfts.map((nft, i) => (
            <div key={i} className="border shadow rounded-xl overflow-hidden bg-white">
              <img src={nft.image} className="rounded" />
              <div className="p-4">
                <p className="text-2xl font-bold">Price - {nft.price} MATIC</p>
                <button
                  className="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                  onClick={() => listNFT(nft)}
                >
                  List
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}
