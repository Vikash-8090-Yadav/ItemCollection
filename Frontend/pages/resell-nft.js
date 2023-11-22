import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Navbar from "../Component/Course/Nav";

import { useBiconomy } from '../Component/Hooks/Connection';
import {
  marketplaceAddress
} from '../config'

import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
// const marketplaceAddress = "0xF2B8a621d0F517e9F756fDC2E69d2d70eB968174";

export default function ResellNFT() {
  const {signer,provider,smartAccount, smartAccountAddress,connect} = useBiconomy();
  const [formInput, updateFormInput] = useState({ price: '', image: '' })
  const router = useRouter()
  const { id, tokenURI } = router.query
  const { image, price } = formInput

  useEffect(() => {
    fetchNFT()
  }, [id])

  async function fetchNFT() {
    if (!tokenURI) return
    const meta = await axios.get(tokenURI)
    updateFormInput(state => ({ ...state, image: meta.data.image }))
  }

  async function listNFTForSale() {
    if (!price) return
    const provider1 = new ethers.providers.Web3Provider(window.ethereum);
    await provider1.send('eth_requestAccounts', []);
    const signer1 = provider1.getSigner();
   

    const priceFormatted = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer1)
    let listingPrice = await contract.getListingPrice()

    listingPrice = listingPrice.toString()
    // let transaction = await contract.resellToken(id, priceFormatted, { value: listingPrice })
    // await transaction.wait()

    const abi1 = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi1);
    // alert(nft.tokenId);
    // const id = nft.tokenId;
    const encodedData = iface.encodeFunctionData("resellToken", [id,priceFormatted]);

    const result = await provider.sendUserOperation({
      target: marketplaceAddress, // Replace with the desired target address
      data: encodedData, // Replace with the desired call data
      value: listingPrice,
    });

    const txHash = await provider.waitForUserOperationTransaction(
      result.hash
    );
  
    console.log("\nTransaction hash: ", txHash);
  
    const userOpReceipt = await provider.getUserOperationReceipt(
      result.hash
    );
  
    console.log("\nUser operation receipt: ", userOpReceipt);
  
    const txReceipt = await provider.rpcClient.waitForTransactionReceipt({
      hash: txHash,
    });
  
    console.log(txReceipt);
   
    router.push('/marketplace')
  }

  return (
    <div>
    <Navbar/>

    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input
          placeholder="Asset Price in Eth"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        {
          image && (
            <img className="rounded mt-4" width="350" src={image} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
          List NFT
        </button>
      </div>
    </div>
    </div>
  )
}