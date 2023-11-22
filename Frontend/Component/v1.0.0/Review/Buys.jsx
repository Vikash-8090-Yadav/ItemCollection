
const marketplaceAddress = "0xF2B8a621d0F517e9F756fDC2E69d2d70eB968174";
import React, { useState, useMemo, useEffect, useContext } from "react";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useBiconomy } from "../../Hooks/Connection";
import NFTMarketplace from '../../../artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json'

import { ethers } from "ethers";



const Buy = ({ state }) => {
  const {provider,smartAccount, smartAccountAddress,connect} = useBiconomy();
  
  useEffect(() => {
    // This code will run when the component mounts
    connect();

    // If you need to perform cleanup when the component unmounts, return a function from useEffect
    return () => {
      // Cleanup code (if needed)
    };
  }, []); 

  const buyChai = async (event) => {

    console.log(provider);
    
    event.preventDefault();
    const { contract } = state;
    const name = document.querySelector("#name").value;
    const message = document.querySelector("#message").value;

    console.log(name, message, contract);
    alert(name);
    alert("moving to meesage");
    alert(message);
    const amount = { value: ethers.utils.parseEther("0.001") };

    // const transaction = await contract.buyChai(name, message,amount);
    const abi = NFTMarketplace.abi;
    const iface = new ethers.utils.Interface(abi);
    const encodedData = iface.encodeFunctionData("buyChai", [name, message]);

    // await transaction.wait();


    try{
    
      // const approvalTrx = await contract.sendUserOperation.buyChai(name, message,amount);
      const result = await provider.sendUserOperation({
        target: marketplaceAddress, // Replace with the desired target address
        data: encodedData, // Replace with the desired call data
        value: ethers.utils.parseEther('0.001'),
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
      // console.log(hash);
  
  
      // const tx1 = {
      //   target: marketplaceAddress,
      //   data: approvalTrx.data,
      //   value: ethers.utils.parseEther('0.001'),
  
      // }

  // console.log(tx1);
  
      // const txResponse = await smartAccount.sendTransaction({ transaction: tx1 })
      // const userOp = await smartAccount.buildUserOp([tx1]);
      // console.log({ userOp })
     
        // const polygonScanlink = `https://mumbai.polygonscan.com/tx/${receipt.transactionHash}`
        // toast.success(<a target="_blank" href={polygonScanlink}>Success Click to view transaction</a>, {
        //   position: "top-right",
        //   autoClose: 18000,
        //   hideProgressBar: false,
        //   closeOnClick: true,
        //   pauseOnHover: true,
        //   draggable: true,
        //   progress: undefined,
        //   theme: "dark",
        //   });
    }catch(error){
      console.log(error)
    }



    alert(name);
    alert("moving to meesage");
    alert(message);
    console.log("Transaction is done");
    
  };
  

  return (
    <>
      <div name = "contact" className = "w-full  ml-28 p-6">
        <div className = "flex flex-col p-4 justify-center max-w-screen-lg mx-auto ">
            <div className = " mn pb-8">
                <p className = "text-4xl font-bold text-center  flex items-center justify-center">Review  a Course
                  {/* <Image src = {Coffee} height="50" width="50" className = "mx-3 transform flip-horizontal" /> */}
                </p>
                <p className = "py-6 text-center text-xl font-semibold">Submit the Review by filling  the form below .</p>
            </div>

            <div className = "flex justify-center items-center">
                <form  onSubmit={buyChai} className = "flex flex-col w-full md:w-1/2">
                    <input type = "text" id = "name" placeholder = "Enter Course name" className = "p-2 bg-transparent border-2 border-white rounded-md focus:outline-none text-white" />
                    <textarea placeholder = "Enter your Review Message" id = "message" rows = "8" className = "p-2 bg-transparent border-2 border-white rounded-md focus:outline-none text-white" />
                    <button  type="submit"
                  disabled={!state.contract} className = " btn btn-primary px-6 py-6 bg-gradient-to-b from-cyan-500 to-blue-500 my-8 mx-auto flex items-center rounded-md hover:scale-110 duration-150 text-white  font-semibold" >Complete Review and Get Direct NFT </button>
                </form>
            </div>
        </div>
      </div>
    </>
  );
};
export default Buy;
