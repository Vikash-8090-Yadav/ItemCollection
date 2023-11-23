// Endpoint for  olx Subgraph endpoints:
// Queries (HTTP):     https://api.studio.thegraph.com/query/54911/olx-marketplac/v0.0.1

import { useState, useEffect } from "react";
import { createClient } from "urql";
import { toast, ToastContainer } from 'react-toastify';
import { useAlchemy } from "../../Hooks/Connection";

const Memos = ({ state }) => {


  const {provider,smartAccount, smartAccountAddress,connect} = useAlchemy();
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const [memos, setMemos] = useState([]);

  const { contract } = state;

  useEffect(() => {
    const memosMessage = async () => {
      if (contract) {
        const memos = await contract.getMemos();
        setMemos(memos);
      }
    };
    memosMessage();
  }, [contract]);

  console.log(memos)

  return (
    <>
      <p className="mncnt" style={{ textAlign: "center", marginTop: "20px" }}>
        REVIEWS
      </p>
      {memos.map((memo) => {
      return (
        <div
          className="container-fluid"
          style={{ width: "100%" }}
          key={Math.random()}
        >
          <table
            style={{
              marginBottom: "10px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    backgroundColor: "#96D4D4",
                    border: "1px solid white",
                    borderCollapse: "collapse",
                    padding: "7px",
                    width: "100px",
                  }}
                >
                  {memo.name}
                </td>
                <td
                  style={{
                    backgroundColor: "#96D4D4",
                    border: "1px solid white",
                    borderCollapse: "collapse",
                    padding: "7px",
                    width: "800px",
                  }}
                >
                  {new Date(memo.timestamp * 1000).toLocaleString()}
                </td>
                <td
                  style={{
                    backgroundColor: "#96D4D4",
                    border: "1px solid white",
                    borderCollapse: "collapse",
                    padding: "7px",
                    width: "300px",
                  }}
                >
                  {memo.message}
                </td>
                <td
                  style={{
                    backgroundColor: "#96D4D4",
                    border: "1px solid white",
                    borderCollapse: "collapse",
                    padding: "7px",
                    width: "400px",
                  }}
                >
                  {memo.from}
                </td>
              </tr>
            </tbody>
          </table>
          
        </div>
        );
      })}
      
    </>
  );
};

export default Memos;
