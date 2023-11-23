
const marketplaceAddress = "0x858bdf757970E13036605248C27beAeA733B17AB";
import React, { useState, useMemo, useEffect, useContext } from "react";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAlchemy } from "../../Hooks/Connection";
import NFTMarketplace from '../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

import { ethers } from "ethers";



const Buy = ({ state }) => {

  const AlchemyTokenAbi =[
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_param",
          "type": "uint256"
        }
      ],
      "name": "callFunction",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "pure",
      "type": "function"
    }
  ];
  const iface = new ethers.utils.Interface(AlchemyTokenAbi);
  const uoCallData  = iface.encodeFunctionData("callFunction", [1]);
  const {provider,smartAccount, smartAccountAddress,connect} = useAlchemy();
  
  useEffect(() => {
    // This code will run when the component mounts
    connect();

    // If you need to perform cleanup when the component unmounts, return a function from useEffect
    return () => {
      // Cleanup code (if needed)
    };
  }, []); 

  const buyChai = async (event) => {
    
    event.preventDefault();
    const { contract } = state;
    const name = document.querySelector("#name").value;
    const message = document.querySelector("#message").value;

    const amount = { value: ethers.utils.parseEther("0.001") };

    // const transaction = await contract.buyChai(name, message,amount);
    const abi = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi);
    const encodedData = iface.encodeFunctionData("buyChai", [name, message]);

    // await transaction.wait();


    try{
      const GAS_MANAGER_POLICY_ID = "f9d6cd57-434c-4300-9ae2-bf5ea0624b96";

      provider.withAlchemyGasManager({
        policyId: GAS_MANAGER_POLICY_ID, // replace with your policy id, get yours at https://dashboard.alchemy.com/
      });

      
      const result = await provider.sendUserOperation(
        { target: marketplaceAddress, // Replace with the desired target address
        data: encodedData, // Replace with the desired call data
        value: ethers.utils.parseEther('0.001')},
        
      );


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
    }catch(error){
      console.log(error)
    }
    
  };
  

  return (
    <>
      <div name = "contact" className = "w-full  ml-28 p-6">
        <div className = "flex flex-col p-4 justify-center max-w-screen-lg mx-auto ">
            <div className = " mn pb-8">
                <p className = "text-4xl font-bold text-center  flex items-center justify-center">Review   A ITEM
                  {/* <Image src = {Coffee} height="50" width="50" className = "mx-3 transform flip-horizontal" /> */}
                </p>
                <p className = "py-6 text-center text-xl font-semibold">Submit the Review by filling  the form below .</p>
            </div>

            <div className = "flex justify-center items-center">
                <form  onSubmit={buyChai} className = "flex flex-col w-full md:w-1/2">
                    <input type = "text" id = "name" placeholder = "Enter Course name" className = "p-2 bg-transparent border-2 border-white rounded-md focus:outline-none text-white" />
                    <textarea placeholder = "Enter your Review Message" id = "message" rows = "8" className = "p-2 bg-transparent border-2 border-white rounded-md focus:outline-none text-white" />
                    <button  type="submit"
                  disabled={!state.contract} className = " btn btn-primary px-6 py-6 bg-gradient-to-b from-cyan-500 to-blue-500 my-8 mx-auto flex items-center rounded-md hover:scale-110 duration-150 text-white  font-semibold" >Complete Review and Donate us 0.01 Matic </button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
};
export default Buy;
