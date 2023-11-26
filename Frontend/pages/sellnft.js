
import { ethers } from 'ethers';
import { useRouter } from 'next/router';
import React, { useState, useMemo, useEffect, useContext } from "react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { TailSpin } from "react-loader-spinner";
import Navbar from "../Component/Course/Nav";
import { useAlchemy } from '../Component/Hooks/Connection';

import { create as IPFSHTTPClient } from 'ipfs-http-client';

const projectId = '2EFZSrxXvWgXDpOsDrr4cQosKcl';
const ProjectSecret = 'b84c6cb2eec9c4536a0b6424ca709f9d';

const auth =
  'Basic ' + Buffer.from(projectId + ':' + ProjectSecret).toString('base64');

const client = IPFSHTTPClient({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});


import { marketplaceAddress } from '../config';
import NFTMarketplace from '../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

const CreateItem=() => {

  const {provider,smartAccount, smartAccountAddress,connect} = useAlchemy();



 console.log(smartAccount)
 console.log(provider);

const [file, setFile] = useState(null);

  // 
  const [Uploading, setuploading] = useState(false);
	const [uploaded, setuploaded] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' });
  const router = useRouter();

  async function onChange(e) {
    e.preventDefault();
    const file = e.target.files[0];
    try {

    const selectedFile = e.target.files ? file : null;
    setFile(selectedFile);
    
    
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      }); 
      const url = `https://sal-dapp.infura-ipfs.io/ipfs/${added.path}`;
      setFileUrl(url);
      alert("Added")
    } catch (error) {
      alert("Error")
      console.log('Error uploading file: ', error);
    }

    

  }

  async function uploadToIPFS() {
		setuploading(true);
    const { name, description, price } = formInput;


    if(!name){
      toast.warn("Asset Name filed is empty");
    }
    else if(description == ""){
      toast.warn("Asset description filed is empty");
    }
    else if(price== ""){
      toast.warn("Price filed is empty");
    }
    else if(uploaded == false){
      toast.warn("Files upload required");
    }
   

  
    if (!name || !description || !price || !fileUrl) return;
 

    
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });

    try {
      




      const added = await client.add(data);
      const url =  `https://sal-dapp.infura-ipfs.io/ipfs/${added.path}`;
      
      return url;
    } catch (error) {
      toast.warn("Error uploading image");
      console.log('Error uploading file: ', error);
    }
  
    setuploading(false);
		setuploaded(true);
		 
		toast.success("Files uploaded sucessfully");

  }


  async function listNFTForSale(e) {
    
    e.preventDefault();

    const url = await uploadToIPFS();
    // const provider =  new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/95688893704a4d5bac083296c3547383")
    // const signer = provider.getSigner();

    
    const price = ethers.utils.parseUnits(formInput.price, 'ether');
    // let contract = new ethers.Contract(
    //   marketplaceAddress,
    //   NFTMarketplace.abi,
    //   provider
    // );
    
    // let listingPrice = await contract.getListingPrice();
    // listingPrice = ethers.utils.parseEther(listingPrice.toString());
    

try{
  const abi = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi);
    const encodedData = iface.encodeFunctionData("createToken", [url, price]);
    const GAS_MANAGER_POLICY_ID = "f9d6cd57-434c-4300-9ae2-bf5ea0624b96";

    provider.withAlchemyGasManager({
      policyId: GAS_MANAGER_POLICY_ID, // replace with your policy id, get yours at https://dashboard.alchemy.com/
    });

const result = await provider.sendUserOperation({
        target: marketplaceAddress, // Replace with the desired target address
        data: encodedData, // Replace with the desired call data
        value: ethers.utils.parseEther('0.025'),
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
      // console.log("txHash", receipt.transactionHash);
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
  }catch(error){
    console.log(error)
  }


    // await transaction.wait();
    alert('Successfully created NFT');
    toast.success("Files uploaded sucessfully");
    router.replace('/marketplace');
  }

  return (
    <>
    <Navbar/>
      <div className="min-h-screen py-10 bg-gradient-to-r from-green-700 to-green-300">
        <div className="container mx-auto">
          {/* <Auth/> */}
          <div className="flex w-8/12 bg-white flex-col md:flex-row rounded-xl mx-auto shadow-lg overflow-hidden">
          <div className="md:w-1/2 bg-black flex flex-col justify-center items-center">
            <h2 className='text-3xl mb-4 text-white'>Add your details</h2>
            <div>
              <p className='text-justify px-4 text-white'>Congratulations on taking the step to become a part of our vibrant community! By contributing your unique items to "Item-Collection," you're not just listing products; you're creating opportunities for others to discover and own exceptional pieces. Your participation in our marketplace enriches the experience for all, fostering a dynamic environment for collectors and enthusiasts alike. Thank you for being an integral part of our growing network of passionate traders and buyers.</p>
            </div>
          </div>
          <div className="md:w-1/2 py-10 px-12">
            <p className="mb-3">Sell your ITEM and get paid.</p>
            <form>
              <div className="mt-5">
                <input placeholder="Course Name" className="border-2 border-black rounded p-4 mb-2 w-full" onChange={(e) => updateFormInput({ ...formInput, name: e.target.value })}/>
              </div>

              <div className="mt-5">
                <textarea placeholder="Course Description" className="border-2 border-black rounded p-4 mb-2 w-full" onChange={(e) => updateFormInput({ ...formInput, description: e.target.value })}/>  
              </div>
              
              <div className="mt-5">
                <input placeholder="Course Price in MATIC" className="border-2 border-black rounded p-4 mb-2 w-full" onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}/>  
              </div>
              
              <div className="mt-5">
							  <label className="block text-sm font-medium text-gray-700 name1">
								  Select Course Image
							  </label>
							  <div className="mt-1 flex items-center border-2 border-black">
								  <span className="inline-block h-12 w-12 overflow-hidden rounded-full bg-gray-100">
									  
                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    
										  <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
									  </svg>
								  </span>
                  
                  <input type="file" name="Asset" className="ml-3 blockw-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:green-700 focus:outline-non "accept="image/*" onChange={onChange}/>
                        
								  {" "}
							  </div>
						  </div>
						
              {Uploading == true ? (
								<button className="button bg-green-600">
									<TailSpin color="#fff" height={20} />
								</button>
							) : uploaded == false ? (
								<button className="rounded-xl bg-green-600 button mt-3" onClick={listNFTForSale}>
								  SELL MY ITEM 
							  </button>
							) : (
								<button style={{ cursor: "no-drop" }} className="button">
									Files uploaded sucessfully
								</button>
							)}
            </form>
          </div>
          </div>
        </div>
       
      </div>
  
    </>
  );
}

export default CreateItem;