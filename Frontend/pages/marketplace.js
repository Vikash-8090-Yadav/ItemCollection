import { Signer, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Navbar from "../Component/Course/Nav";
// import {
//   marketplaceAddress
// } from '../config'
const marketplaceAddress = "0xF2B8a621d0F517e9F756fDC2E69d2d70eB968174";
import { useBiconomy } from '../Component/Hooks/Connection';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'
export default function Home() {
  const {signer,provider,smartAccount, smartAccountAddress,connect} = useBiconomy();
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    // This code will run when the component mounts
    // connect();
    loadNFTs();

    // If you need to perform cleanup when the component unmounts, return a function from useEffect
    return () => {
      // Cleanup code (if needed)
    };
  }, []); 
  // useEffect(() => {
  //   connect();
  //   loadNFTs()
  // }, [])

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    console.log("Provider",smartAccountAddress)
    // const signer = provider.getSigner();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const Signer = provider.getSigner();

    console.log(Signer);
    
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, Signer)
    // const iface = new ethers.utils.Interface(NFTMarketplace.abi);
    // const encodedData = iface.encodeFunctionData("fetchMarketItems", []);
    const data = await contract.fetchMarketItems()

    // const { hash } = await provider.sendUserOperation({
    //   target: "0xF2B8a621d0F517e9F756fDC2E69d2d70eB968174", // Replace with the desired target address
    //   data: encodedData, // Replace with the desired call data
    //   value: 0n,
    // });
    // console.log(hash);

    /*
    *  map over items returned from smart contract and format 
    *  them as well as fetch their token metadata
    */
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description,
      }
      return item
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    // const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send('eth_requestAccounts', []);
    // const signer = provider.getSigner();

    // const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, provider)

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    // const transaction = await contract.createMarketSale(nft.tokenId, {
    //   value: price
    // })
    // await transaction.wait()
    const abi = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi);
    alert(nft.tokenId);
    const encodedData = iface.encodeFunctionData("createMarketSale", [nft.tokenId]);

    console.log(encodedData);
    alert(price)

const result = await provider.sendUserOperation({
        target: "0xF2B8a621d0F517e9F756fDC2E69d2d70eB968174", // Replace with the desired target address
        data: encodedData, // Replace with the desired call data
        value: price,
      });
      alert("Yaha tk aa gya h")
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
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-white text-3xl">No Courses in marketplace</h1>)
  return (
    <div>
      <Navbar/>

    <div className="flex mrkt  justify-center">
  
      <div className="px-10" style={{ maxWidth: '1600px' }}>
        <div className="grid flex  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 unmrk">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border rounded-t-md  umrkt shadow rounded-xl overflow-hidden">
                <img   height="250px"  className = " w-full rounded-t-md duration-200 hover:scale-110 hover:overflow-hidden" src={nft.image} />
                <div className="p-4">
                  <p style={{ height: '100%' }} className="text-2xl font-semibold">{nft.name}</p>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4  umrk bg-black">
                  <p className="text-2xl font-bold text-white">{nft.price} MATIC</p>
                  <button className=" hover:rotate-2 delay-100 transition ease-in-out   text-center border hover:bg-gray-100 hover:shadow-md border-gray-500 rounded-md mt-4 w-full bg-green-500 text-cyan font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
    </div>
  )
}