import React, { useState, useEffect, useContext } from 'react';
import walletContext from '../Context/walletContext';
import { useNavigate } from 'react-router-dom';

const BussinessLogin = () => {

    const navigate = useNavigate();
    const [bussiness, setBussiness] = useState({ _username: "", _businessDomain: "", _businessDescription: "", _businessCategory: "" })
    const isBussiness = true;
    const context = useContext(walletContext);
    const { currentAccount, isWalletConnected, myContarct } = context;
    const handleChange = (e) => {
        setBussiness({ ...bussiness, [e.target.name]: e.target.value })
    }
    const registerBussiness = async (e) => {
        e.preventDefault();
        // console.log(bussiness, isBussiness);
        const registeredBussiness = await myContarct.methods.registerUser(bussiness._username, isBussiness, bussiness._businessDomain, bussiness._businessDescription, bussiness._businessCategory).send({ from: currentAccount });
        // console.log(registeredBussiness);
        setBussiness({ _username: "", _businessDomain: "", _businessDescription: "", _businessCategory: "" });
        navigate('/');

    }

    useEffect(() => {
        if (isWalletConnected == false) {
            navigate('/');
        }
    },); // This effect will run whenever isWalletConnected changes
    return (
        <div className="container">
            <h1 className="text-center my-5">Enter Your Bussiness Details</h1>
            <div className="row d-flex justify-content-center">
                <div className="col-md-6 col-sm-12 col-12 shadow px-4 py-5 bg-form  rounded">
                    <form action="" onSubmit={registerBussiness}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Bussiness Name</label>
                            <input type="text" className="form-control bg-dark" name="_username" value={bussiness._username} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Bussiness Domain</label>
                            <input type="text" className="form-control bg-dark" name="_businessDomain" value={bussiness._businessDomain} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Bussiness Description</label>
                            <input type="text" className="form-control bg-dark" name="_businessDescription" value={bussiness._businessDescription} onChange={handleChange} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">Bussines Category</label>
                            <input type="text" className="form-control bg-dark" name="_businessCategory" value={bussiness._businessCategory} onChange={handleChange} />
                        </div>

                        <div className="d-flex justify-content-center">
                            <button className="btn-gradient">Sign Up</button>
                        </div>

                    </form >
                </div>
            </div>

        </div>
    )
}

export default BussinessLogin