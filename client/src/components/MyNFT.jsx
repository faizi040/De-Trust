import React, { useEffect, useContext, useState } from 'react';
import walletContext from '../Context/walletContext';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';

const MyNFT = () => {
    const [allNfts, setAllNfts] = useState([]);
    const context = useContext(walletContext);
    const { myContarct, currentAccount,user } = context;
    const navigate = useNavigate();
    const web3 = new Web3(window.ethereum);
    const getAllNfts = async () => {
        try {
            const AllNftsTokenId = await myContarct.methods.fetchUserNFTs().call({ from: currentAccount });
            // console.log(AllNftsTokenId);
            const tokenDetailsPromises = AllNftsTokenId.map(async (tokenId) => {
                return myContarct.methods.getReviewDetails(tokenId).call();
            });

            const AllNFTS = await Promise.all(tokenDetailsPromises);
            // console.log(AllNFTS);
            setAllNfts(AllNFTS);
        } catch (error) {
            console.error('Error getting all NFT:', error);
        }
    }
    const handleComment = (SectionId) => {
        try {
            const commentSection = document.getElementById(SectionId);
            if (commentSection.style.display == 'none') {
                commentSection.style.display = 'block';
            }
            else {
                commentSection.style.display = 'none';
            }

        } catch (error) {
            console.error('Error :', error);
        }
    }
    const isWalletConnected = () => {
        if (!currentAccount || !user) {
            navigate('/');
        }
    }
    useEffect(() => {
        getAllNfts();
        isWalletConnected();
    },[]);
    return (
        <>
            <div className="container ">

                <div className="row">
                    <h1 className="text-center my-4">MY NFT's</h1>
                    {
                        allNfts.map((NFT, key) => (

                            <div className='col-md-6 col-sm-6 col-12' key={key}>
                                <div className='shadow p-3 my-5 bg-form rounded mx-2'>


                                    <div style={{ width: "100%", height: "120px", objectFit: "cover" }}>

                                        <img src={NFT.tokenURI} alt="Generated Review" style={{ maxWidth: '100%', height: "100%" }} />
                                    </div>
                                    <div className="d-flex  mt-3">
                                        <a ><i className="bi bi-hand-thumbs-up-fill h5" >&nbsp;{NFT.upvotes}</i></a>
                                        {/* onClick={() => upVote(NFT.tokenid)} */}
                                        <a  className='mx-auto text-decoration-none text-white'><i className="bi bi-hand-thumbs-down-fill h5 ">&nbsp;{NFT.downvotes}</i></a>
                                        {/* onClick={() => downVote(NFT.tokenid)} */}
                                        <p className='h5' onClick={() => handleComment(`comment-Section-${key}`)}>Comments</p>
                                    </div>
                                    <ul className="list-group list-group-flush" id={`comment-Section-${key}`} style={{ display: 'none' }}>
                                        {NFT.comments.map((comment, id) => {
                                            return <li className="list-group-item bg-dark text-white" key={id}>{comment}</li>
                                        })}
                                    </ul> <hr />
                                    <div className='d-flex justify-content-center align-items-center'>
                                        {/* <button className='btn-gradient'>List For Sale</button> */}
                                        <p >Price : {web3.utils.fromWei(NFT._price, 'ether')} ETH</p>
                                    </div>
                                   

                                </div>
                            </div>

                        ))}

                </div>
            </div>
        </>
    )
}

export default MyNFT