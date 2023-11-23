
import { AlchemyProvider } from "@alchemy/aa-alchemy";
import {
  LightSmartContractAccount,
  getDefaultLightAccountFactoryAddress,
} from "@alchemy/aa-accounts";
import { ParticleNetwork } from "@particle-network/auth";
import { ParticleProvider } from "@particle-network/provider";
import { LocalAccountSigner } from "@alchemy/aa-core";
import { polygonMumbai } from "viem/chains";
import { WalletClientSigner,  SmartAccountSigner } from "@alchemy/aa-core";
import { createWalletClient, custom } from "viem";
import { ethers } from "ethers";
const chain = polygonMumbai;
const PRIVATE_KEY = "0x4b37e644ab78c477cf92ed880dd52d5b0d50bfe36056696d1e05ba480d5abaa3"; // Replace with the private key of your EOA that will be the owner of Light Account


const particle = new ParticleNetwork({
  projectId: "add7fc6d-c5e0-4018-a6e1-4d7c10c79f2d" ,
  clientKey: "cergjuCrbXhDPdwbzQMaGqubnTZ4m8zDuwyXlrJF" ,
  appId: "sT0XVkK7qOG68D2cTEZAOsNXuzDU2q39z2mp518a" ,
  chainName: "polygon",
  chainId: 80001,
});

const particleProvider = new ParticleProvider(particle.auth);

// Assumes user has logged in with something like particle.auth.login(), Particle Connect, or through other misc. connection

const particleWalletClient = createWalletClient({
  transport: custom(particleProvider),
});

const particleSigner = new WalletClientSigner(
  particleWalletClient,
  "particle"
);


const eoaSigner =
  LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY); 

import React, { useState, useMemo, useEffect, useContext } from "react";


const AlchmeyContext = React.createContext({
  smartAccount: undefined,
  smartAccountAddress: undefined,
  provider: undefined,
  signer: undefined,
  connect: undefined
})

export const useAlchemy = () => {
  return useContext(AlchmeyContext)
}

export const BiconomyProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [smartAccount, setSmartAccount] = useState()
  const [smartAccountAddress, setSmartAccountAddress] = useState()
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)

  const externalProvider = window.ethereum; // or anyother EIP-1193 provider

const walletClient = createWalletClient({
  chain: chain, // can provide a different chain here
  transport: custom(externalProvider),
});

  const connect = async () => {
   
    try {
      setLoading(true)

      const provider = new AlchemyProvider({
        apiKey: "grp3kc-gOX62hc6iSfXoazOzLuLWY6VW", // Replace with your Alchemy API key, you can get one at https://dashboard.alchemy.com/
        chain,
        // Entrypoint address, you can use a different entrypoint if needed, check out https://docs.alchemy.com/reference/eth-supportedentrypoints for all the supported entrypoints
        entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
      }).connect(
        (rpcClient) =>
          new LightSmartContractAccount({
            entryPointAddress: "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789",
            chain: rpcClient.chain,
            owner: eoaSigner,
            factoryAddress: getDefaultLightAccountFactoryAddress(rpcClient.chain), // Default address for Light Account on Sepolia, you can replace it with your own.
            rpcClient,
          })
      );

      console.log(eoaSigner);
      

      setProvider(provider);
      setSigner(eoaSigner)

    

     
      const address =await provider.getAddress();
      setSmartAccountAddress(address)
       localStorage.setItem('smartAccountAddress',smartAccountAddress);
      // console.log({ smartAccountAddress })
      setLoading(false)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <AlchmeyContext.Provider
      value={{
        smartAccount: smartAccount,
        smartAccountAddress: smartAccountAddress,
        provider: provider,
        signer:signer,
        connect
      }}
    >
      {children}
    </AlchmeyContext.Provider>
  )
}
