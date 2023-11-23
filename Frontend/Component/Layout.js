
import Footer from "./v1.0.0/footer/footer";

import { ToastContainer } from 'react-toastify';
import Navbar from "../Component/v1.0.0/Navbar/Navbar"

import { useEffect, useRef } from 'react'
import { useAlchemy } from "./Hooks/Connection";
export default function Layout({ children }) {
  const {provider,smartAccount, smartAccountAddress,connect} = useAlchemy();
  useEffect(() => {
    // This code will run when the component mounts
    connect();

    // If you need to perform cleanup when the component unmounts, return a function from useEffect
    return () => {
      // Cleanup code (if needed)
    };
  }, []); 


  return (
    <>

        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css" />
        <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css" />
        <div>
        <Navbar/>
        </div>
        <ToastContainer/>
        {children}


        <Footer/>
    
    </>
  )
}
