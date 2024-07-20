import React, { useEffect, useContext, useState } from 'react';
import walletContext from '../Context/walletContext';
import { useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { create as ipfsHttpClient } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import Web3 from 'web3';
import { useNavigate } from 'react-router-dom';


const CreateReview = () => {
  const [bussiness, setBussiness] = useState([]);
  const [review, setReview] = useState('');
  const [comment, setComment] = useState('');
  const [allNfts, setAllNfts] = useState([]);
  const [nftUrl, setNftUrl] = useState('');
  const { domain } = useParams();
  const context = useContext(walletContext);
  const { myContarct, currentAccount, user } = context;
  const web3 = new Web3(window.ethereum);
  const projectId = import.meta.env.VITE_APP_NFT_IPFS_PROJECT_ID;
  const projectSecret = import.meta.env.VITE_APP_NFT_IPFS_API_KEY_SECRET;
  const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString('base64')}`;
  const navigate = useNavigate();
  const client = ipfsHttpClient({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
      authorization: auth,
    },
  });
  const generateImage = async (e) => {
    try {
      e.preventDefault();
      const reviewContainer = document.getElementById('review-container');
      if (reviewContainer) {
        reviewContainer.style.visibility = 'visible'; // Make the container visible temporarily
        html2canvas(reviewContainer).then((canvas) => {
          reviewContainer.style.visibility = 'hidden'; // Hide the container again
          const imgData = canvas.toDataURL('image/png');
          // setImageUrl(imgData);
          uploadToIPFS(imgData).then((url) => {
            console.log(url);
            setNftUrl(url);
          });
        });

      }
      const amountInEther = 0.025;
      const listingPrice = 0.001;
      const ListingPriceInWei = web3.utils.toWei(listingPrice.toString(), 'ether');
      const amountInWei = web3.utils.toWei(amountInEther.toString(), 'ether');
      const newNFT = await myContarct.methods.createReviewNFT(nftUrl, amountInWei, domain).send({ from: currentAccount, value: ListingPriceInWei });
      console.log(newNFT);
      setReview('');
      await getAllNfts();

    } catch (error) {
      console.error('Error upvoting review:', error);
    }
  };
  const fetchFileContent = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const data = await response.blob();
      return data;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  };

  const uploadToIPFS = async (fileUrl) => {
    const subdomain = 'https://cryptosea-nft-marketplace.infura-ipfs.io';
    const fileContent = await fetchFileContent(fileUrl);
    // console.log(fileContent);
    try {
      const added = await Client.add({ content: fileContent });

      const url = `${subdomain}/ipfs/${added.path}`;
      return url;
    } catch (error) {
      console.log('Error uploading file to ipfs');
    }
  };
  const getAllNfts = async () => {
    try {
      const AllNftsTokenId = await myContarct.methods.fetchNFTsByDomain(domain).call();
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
  const getBussinessDetails = async () => {
    try {
      const registeredBussiness = await myContarct.methods.getBusinessDetailsByDomain(domain).call();
      // console.log(registeredBussiness);
      // console.log(typeof (registeredBussiness));
      setBussiness(registeredBussiness);
    } catch (error) {
      console.error('Error getting bussiness Details', error);
    }
  }

  const upVote = async (tokenId) => {
    try {
      const upvote = await myContarct.methods.upvoteReview(tokenId).send({ from: currentAccount });
      await getAllNfts();
    } catch (error) {
      console.error('Error upvoting review:', error);
    }
  }
  const downVote = async (tokenId) => {
    try {
      const downvote = await myContarct.methods.downvoteReview(tokenId).send({ from: currentAccount });
      await getAllNfts();
    } catch (error) {
      console.error('Error downvoting review:', error);
    }
  }
  const createComment = async (e, tokenId) => {
    try {
      e.preventDefault();
      console.log(tokenId);
      const hasCommented = await myContarct.methods.commentOnReview(tokenId, comment).send({ from: currentAccount });
      console.log(hasCommented);
      setComment('');
      await getAllNfts();
    } catch (error) {
      console.error('Error adding Comment:', error);
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
  const handleReview = (SectionId) => {
    try {
      const reviewSection = document.getElementById(SectionId);
      if (reviewSection.style.display == 'none') {
        reviewSection.style.display = 'block';
      }
      else {
        reviewSection.style.display = 'none';
      }

    } catch (error) {
      console.error('Error :', error);
    }
  }

  const BuyNFT = async (tokenId, price) => {
    try {
      console.log(tokenId);
      const NFTBought = await myContarct.methods.buyNFT(tokenId).send({ from: currentAccount, value: price });
      console.log(NFTBought);
      await getAllNfts();

    } catch (error) {
      console.error('Error :', error);
    }

  }
  const deListNFT = async (tokenId, domain) => {
    const NFTdeListed = await myContarct.methods.delistNFT(tokenId, domain).send({ from: currentAccount });

    // const NFTdeListed = await myContarct.methods.delistNFT(tokenId,domain).call({ from: currentAccount});
    console.log(tokenId, domain, NFTdeListed);
    await getAllNfts();


  }
  const isWalletConnected = () => {
    if (!currentAccount || !user) {
      navigate('/');
    }

  }
  const shortenAddress = (address) => (
    `${address.slice(0, 5)}...${address.slice(address.length - 4)}`
  );
  useEffect(() => {
    getBussinessDetails();
  }, [domain]); // Include 'domain' in the dependency array
  useEffect(() => {
    getAllNfts();
    isWalletConnected();
  }, []);
  return (
    <>
      <div className="container ">
        <div className='shadow p-3 mt-5 bg-body-tertiary rounded bg-gardient'>
          <h1 className="mt-4 ms-5">{bussiness.username}</h1>
          <div className="d-flex">
            <p className='ms-5  h5'>{bussiness.businessCategory}</p>
            <div className="ms-4 ">
              <i className="bi bi-star-fill text-primary"></i>
              <i className="bi bi-star-fill text-primary"></i>
              <i className="bi bi-star-fill text-primary"></i>
              <i className="bi bi-star-fill text-primary"></i>
              <i className="bi bi-star-fill text-primary"></i>

            </div>
          </div>
          <p className="ms-5 py-3 h6">{bussiness.businessDescription}</p>
        </div>
        <div className="my-5 pt-4 shadow px-5 rounded">
          <form className=''>
            <div className="mb-3 review-content" >
              <label htmlFor="username" className="form-label h6">Write a Review</label>
              <input type="text" className="form-control review-text bg-form" id="review" value={review} onChange={(e) => setReview(e.target.value)} />
            </div>

            <div className="d-flex justify-content-center">
              <button className="btn-gradient" onClick={generateImage}>Submit</button>
            </div>

          </form >

          <div id="review-container" className='review-container' style={{ visibility: 'hidden' }}>
            <div className="review-content">
              <p className="review-text">Company Name : {bussiness.username}</p>
              <p className="variable-data">Review : {review}</p>
            </div>
          </div>

        </div>

        <div className="row">
          <h1 className="text-center my-4">Review NFT's</h1>
          {
            allNfts.map((NFT, key) => (
              !NFT._sold && (

                <div className='col-md-6 col-sm-6 col-12' key={key}>
                  <div className='shadow p-3 my-4 bg-form rounded mx-2'>


                    <div style={{ width: "100%", height: "120px", objectFit: "cover" }}>

                      <img src={NFT.tokenURI} alt="Generated Review" style={{ maxWidth: '100%', height: "100%" }} />
                    </div>
                    <div className="d-flex  mt-3">
                      <a onClick={() => upVote(NFT.tokenid)}><i className="bi bi-hand-thumbs-up-fill h5" >&nbsp;{NFT.upvotes}</i></a>
                      <a onClick={() => downVote(NFT.tokenid)} className='mx-auto text-decoration-none text-white'><i className="bi bi-hand-thumbs-down-fill h5 ">&nbsp;{NFT.downvotes}</i></a>
                      <p className='h5' onClick={() => handleComment(`comment-Section-${key}`)}>Comments</p>
                    </div>
                    <ul className="list-group list-group-flush" id={`comment-Section-${key}`} style={{ display: 'none' }}>
                      {NFT.comments.map((comment, id) => {
                        return <li className="list-group-item bg-dark text-white" key={id}>{comment}</li>
                      })}
                    </ul> <hr />
                    <div className='d-flex justify-content-between align-items-center'>
                      {NFT._seller.toString().toLowerCase() === currentAccount ?

                        (<button className='btn-gradient' onClick={() => deListNFT(NFT.tokenid, bussiness.userBusinessDomain)}>DeList NFT</button>) : (<button className='btn-gradient' onClick={() => BuyNFT(NFT.tokenid, NFT._price)}>Buy for {web3.utils.fromWei(NFT._price, 'ether')} ETH</button>)
                      }
                      <p >Seller : {shortenAddress(NFT._seller)}</p>
                      <p >Owner : {shortenAddress(NFT._owner)}</p>
                    </div>
                    <hr />
                    <p onClick={() => handleReview(`review-section-${key}`)}>Write a Comment</p>
                    <form id={`review-section-${key}`} style={{ display: 'none' }}>
                      <div className="mb-3 review-content"  >
                        <input type="text" className="form-control review-text bg-dark" id="review" value={comment} onChange={(e) => setComment(e.target.value)} />
                      </div>

                      <div className="d-flex justify-content-center">
                        <button className="btn-gradient" onClick={(e) => createComment(e, NFT.tokenid)}>Comment</button>
                      </div>

                    </form >

                  </div>
                </div>
              )

            ))}

        </div>
      </div>
    </>
  )
}

export default CreateReview

