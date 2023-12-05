import React, { useState, useContext, useEffect } from 'react';
import walletContext from '../Context/walletContext';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const isBussiness = false;
    const context = useContext(walletContext);
    const { currentAccount, isWalletConnected, myContarct } = context;
    const onChange = (e) => {
        setName(e.target.value);
    }
    const registerUser = async (e) => {
        e.preventDefault();
        setName(document.getElementById("username").value);
        console.log(name, isBussiness);
        const registeredUser = await myContarct.methods.registerUser(name, isBussiness, '', '', '').send({ from: currentAccount });
        console.log(registeredUser);
        setName('');
        navigate('/');


    }

    useEffect(() => {
        if (isWalletConnected == false) {
            navigate('/');
        }
    },); // This effect will run whenever isWalletConnected changes

    return (
        <div className="container">
            <h1 className="text-center my-5">Register Your Self</h1>
            <div className="row d-flex justify-content-center">
                <div className="col-md-6 col-sm-12 col-12 shadow px-4 py-5 bg-form  rounded">
                    <form action="" onSubmit={registerUser}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label">User Name</label>
                            <input type="text" className="form-control bg-dark" id="username" value={name} onChange={onChange} />
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
export default UserLogin
