import { useState, useEffect } from 'react';
import walletContext from "./Context/walletContext.jsx";
import Navbar from "./components/Navbar.jsx";
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import UserLogin from './components/UserLogin.jsx';
import BussinessLogin from "./components/BussinessLogin.jsx";
import CreateReview from "./components/CreateReview.jsx";
import NotFound from './components/NotFound.jsx';
import Home from './components/Home.jsx';
import Web3 from 'web3';
import UserAndNFTMarketPlace from "./contracts/UserAndNFTMarketplace.json";
import MyNFT from './components/MyNFT.jsx';
function App() {
  const [isWalletConnected, setWalletConnected] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [user, setUser] = useState(false);
  const web3 = new Web3(window.ethereum);
  const myContarct = new web3.eth.Contract(
    UserAndNFTMarketPlace.abi,
    '0x0312a95c6625312E70F4Fa189A634555C1b135B2'
    // '0x34258f9b70511638E900DF91d616FDd06e2AAdce',
  );
  const connectWallet = async () => {

    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setCurrentAccount(accounts[0]);
        console.log('Connected to wallet:', accounts[0]);
        setWalletConnected(true);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      console.error('No web3 provider detected');
    }
  };

  const isUserRegistered = async () => {
    const isUser = await myContarct.methods.isUser(currentAccount).call();
    console.log(isUser);
    setUser(isUser);
  }



  useEffect(() => {
    isUserRegistered();
    console.log('Current Account:', currentAccount);
  }, [currentAccount]); // This effect will run whenever currentAccount changes

  return (
    <>
      <walletContext.Provider value={{ isWalletConnected, currentAccount, connectWallet, myContarct, user, isUserRegistered }}>
        <Router>
          <Navbar />


          <Routes>
            <Route exact path="/" element={<Home />}></Route>
            <Route exact path="/myNFT" element={<MyNFT />}></Route>
            <Route exact path="/userLogin" element={<UserLogin />}></Route>
            <Route exact path="/bussinessLogin" element={<BussinessLogin />}></Route>
            <Route exact path="/createReview/:domain" element={<CreateReview />}></Route>
            <Route path="*" element={<NotFound />} /> {/* Catch-all route */}
          </Routes>



        </Router>
      </walletContext.Provider>
    </>
  )
}

export default App
