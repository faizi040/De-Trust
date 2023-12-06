import React, { useState, useEffect, useContext } from 'react';
import walletContext from '../Context/walletContext';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Home = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();
  const context = useContext(walletContext);
  const { currentAccount, myContarct,user,isUserRegistered } = context;



  const getAllDomains = async () => {
    const DomainsData = await myContarct.methods.getRegisteredDomains().call();
    const BussinesDetailsPromises = DomainsData.map(async (domain) => {
      return myContarct.methods.getBusinessDetailsByDomain(domain).call();
    });

    const BussinessDetails = await Promise.all(BussinesDetailsPromises);
    setData(BussinessDetails);
    // console.log(data, DomainsData);
    // console.log(typeof (DomainsData));
  }
  useEffect(() => {
    getAllDomains();
    
  }, []);

  useEffect(()=>{
    isUserRegistered();
  },[])


  return (



    <div className='container text-center'>
      {currentAccount ? (
        user?(
        <div>
          <div className='shadow px-3 py-5 mt-5 bg-body-tertiary rounded bg-gardient'>
            <h1 className="mt-4 ms-5">Read Reviews,Write Reviews,Find Companies You can Trust</h1>
          </div>
          <h1 className="my-5">List of All registered Bussinesses</h1>
          <div className="row">
            {
              data.map((Bussiness, index) => (

                <div className="col-md-4 col-sm-6 col-12 " key={index}>
                  <div className='shadow bg-form rounded m-2 p-3'>


                    <ul className="list-group list-group-flush" >
                      <li className="list-group-item bg-dark text-white border-bottom-none"> {Bussiness.username}</li>
                      <Link className="btn-gradient mt-3 text-decoration-none" to={`createReview/${Bussiness.userBusinessDomain}`}>Details</Link>
                    </ul>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      
      ):(
        <div className="alert alert-primary mt-5" role="alert">
        <strong>Please register Yourself </strong>
      </div>
      )
      ) : (
        <div className="alert alert-primary mt-5" role="alert">
          <strong>Please Connect Your wallet</strong>
        </div>
      )}



    </div>
  )
}

export default Home