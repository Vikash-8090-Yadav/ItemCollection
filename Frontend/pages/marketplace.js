import { Signer, ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Navbar from "../Component/Course/Nav";
import { encodeFunctionData } from "viem";
import {
  marketplaceAddress
} from '../config'
import { useAlchemy } from '../Component/Hooks/Connection';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'


export default function Home() {
  const {signer,provider,smartAccount, smartAccountAddress,connect} = useAlchemy();
  const [nfts, setNfts] = useState([])
  const [provider1,setProvider1] = useState('')
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    // This code will run when the component mounts
    // connect();
    setProvider1(provider)
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

    console.log(smartAccountAddress);
    
    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, Signer)
    const data = await contract.fetchMarketItems()
    console.log(data)

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

    console.log(nft)
    const provider1 = new ethers.providers.Web3Provider(window.ethereum);
    await provider1.send('eth_requestAccounts', []);
    const signer1 = provider1.getSigner();

    const contract = new ethers.Contract(marketplaceAddress, NFTMarketplace.abi, signer1)

  

    try{

      const price = ethers.utils.parseUnits((nft.price).toString(), 'ether');
    // const estimatedGas = await contract.estimateGas.createMarketSale(nft.tokenId, {
    //   value: price
    // })
    // await transaction.wait()
    // console.log("estimatedGas",estimatedGas);

    const abi1 = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi1);
    const id = nft.tokenId;
    const encodedData = iface.encodeFunctionData("createMarketSale", [id]);

// const GAS_MANAGER_POLICY_ID = "1d009a93-fb23-4fd1-b6d7-bf9ad9e56d0f";

// provider.withAlchemyGasManager({
//   policyId: GAS_MANAGER_POLICY_ID, // replace with your policy id, get yours at https://dashboard.alchemy.com/
// }); 

    console.log(encodedData);
    console.log(price)
    const GAS_MANAGER_POLICY_ID = "f9d6cd57-434c-4300-9ae2-bf5ea0624b96";

    provider.withAlchemyGasManager({
      policyId: GAS_MANAGER_POLICY_ID, // replace with your policy id, get yours at https://dashboard.alchemy.com/
    });

const result = await provider.sendUserOperation({
        target: marketplaceAddress, // Replace with the desired target address
        data: encodedData, // Replace with the desired call data
        value:  BigInt(Math.floor(price)),
        callGasLimit:"0x2faf080",
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
      const polygonScanlink = `https://mumbai.polygonscan.com/tx/${txHash}`
      toast.success(<a target="_blank" href={polygonScanlink}>Success Click to view transaction</a>, {
        position: "top-right",
        autoClose: 18000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        });
    loadNFTs()
  }catch(error){
    console.log(error)
  }
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 mn  py-10 text-white text-3xl">No Courses in marketplace</h1>)
  return (
    <div>


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