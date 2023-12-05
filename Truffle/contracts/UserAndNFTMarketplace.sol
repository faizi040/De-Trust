// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract UserAndNFTMarketplace is ERC721URIStorage {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    Counters.Counter private _itemsSold;

    uint256 listingPrice = 0.001 ether;

    uint256 ownerCommissionPercentage = 15;
    uint256 creatorCommissionPercentage = 1000 - ownerCommissionPercentage;

    address payable owner;

    mapping(uint256 => MarketItem) private idToMarketItem;
    mapping(address => User) public users;
    mapping(string => bool) public registeredDomains;
    string[] public registeredDomainsArray;
    mapping(address => string) public AlluserDomians;
    address[] public Allusers;

    struct MarketItem {
        uint256 tokenId;
        string tokenURI;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
        string businessDomain;
        string[] comments;
        uint256 upvotes;
        uint256 downvotes;
        bool moderated;
        uint256 timestamp;
        string category;
        // Add other metadata fields as needed
    }

    struct User {
        string username;
        bool isBusiness;
        string businessDomain;
        string businessDescription;
        string businessCategory;
        uint256 reputation;
        // Add other user details as needed
    }

    event MarketItemCreated(
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold,
        string businessDomain
    );

    event UserRegistered(
        string username,
        address userAddress,
        bool isBusiness,
        string businessDomain,
        string businessDescription,
        string businessCategory
    );
    event NFTDelisted(uint256 tokenId, string businessDomain);

    event ReviewVoted(uint256 indexed tokenId, address voter, bool isUpvote);
    event DomainRegistered(string domain);
    event MarketItemSold(
        uint256 indexed tokenId,
        address seller,
        address buyer,
        uint256 price
    );

    constructor() ERC721("Artbyte", "ART") {
        owner = payable(msg.sender);
    }

    function getOwnerShare(uint256 x) private view returns (uint256) {
        return (x / 1000) * ownerCommissionPercentage;
    }

    function getCreatorShare(uint256 x) private view returns (uint256) {
        return (x / 1000) * creatorCommissionPercentage;
    }

    function registerUser(
        string memory _username,
        bool _isBusiness,
        string memory _businessDomain,
        string memory _businessDescription,
        string memory _businessCategory
    ) public {
        require(
            bytes(users[msg.sender].username).length == 0,
            "User already registered"
        );

        users[msg.sender] = User({
            username: _username,
            isBusiness: _isBusiness,
            businessDomain: _isBusiness ? _businessDomain : "",
            businessDescription: _isBusiness ? _businessDescription : "",
            businessCategory: _isBusiness ? _businessCategory : "",
            reputation: 0
        });
        AlluserDomians[msg.sender] = _businessDomain;
        Allusers.push(msg.sender);
        if (_isBusiness && !registeredDomains[_businessDomain]) {
            // Set the business domain as registered during user registration
            registeredDomains[_businessDomain] = true;
            registeredDomainsArray.push(_businessDomain);
            emit DomainRegistered(_businessDomain);
        }

        emit UserRegistered(
            _username,
            msg.sender,
            _isBusiness,
            _businessDomain,
            _businessDescription,
            _businessCategory
        );
    }

    function getRegisteredDomains() public view returns (string[] memory) {
        return registeredDomainsArray;
    }

    // function createReviewNFT(
    //     string memory tokenURI,
    //     uint256 price,
    //     string memory businessDomain
    // ) public payable returns (uint) {
    //     require(
    //         bytes(businessDomain).length > 0,
    //         "Business domain is required"
    //     );
    //     require(bytes(tokenURI).length > 0, "Token URI is required");
    //     require(price > 0, "Price must be at least 1");
    //     // require(msg.value == listingPrice, "Price must be equal to listing price");

    //     _tokenIds.increment();

    //     uint256 newTokenId = _tokenIds.current();

    //     _mint(msg.sender, newTokenId);
    //     _setTokenURI(newTokenId, tokenURI);

    //     // Check if the domain is registered before associating the NFT
    //     require(
    //         registeredDomains[businessDomain],
    //         "Business domain is not registered"
    //     );

    //     // Check if the NFT is not already associated with this domain
    //     require(
    //         !isNFTAssociatedWithDomain(newTokenId, businessDomain),
    //         "NFT is already associated with this domain"
    //     );

    //     createMarketItem(newTokenId, price, businessDomain, tokenURI);

    //     return newTokenId;
    // }
    function createReviewNFT(
        string memory tokenURI,
        uint256 price,
        string memory businessDomain
    ) public payable returns (uint) {
        require(
            bytes(businessDomain).length > 0,
            "Business domain is required"
        );
        require(bytes(tokenURI).length > 0, "Token URI is required");
        require(price > 0, "Price must be at least 1");
        // require(msg.value == listingPrice, "Price must be equal to listing price");
        // Check if the sender has sent the exact listing price
        require(
            msg.value == listingPrice,
            "Price must be equal to listing price"
        );

        // Transfer 0.025 ether to the owner of the contract
        owner.transfer(listingPrice);
        _tokenIds.increment();

        uint256 newTokenId = _tokenIds.current();

        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        // Check if the domain is registered before associating the NFT
        require(
            registeredDomains[businessDomain],
            "Business domain is not registered"
        );

        // Check if the NFT is not already associated with this domain
        require(
            !isNFTAssociatedWithDomain(newTokenId, businessDomain),
            "NFT is already associated with this domain"
        );

        createMarketItem(newTokenId, price, businessDomain, tokenURI);

        return newTokenId;
    }

    function isNFTAssociatedWithDomain(
        uint256 tokenId,
        string memory businessDomain
    ) private view returns (bool) {
        return
            bytes(idToMarketItem[tokenId].businessDomain).length > 0 &&
            keccak256(
                abi.encodePacked(idToMarketItem[tokenId].businessDomain)
            ) ==
            keccak256(abi.encodePacked(businessDomain));
    }

    function createMarketItem(
        uint256 tokenId,
        uint256 price,
        string memory businessDomain,
        string memory tokenURI
    ) private {
        idToMarketItem[tokenId] = MarketItem({
            tokenId: tokenId,
            tokenURI: tokenURI,
            seller: payable(msg.sender),
            owner: payable(msg.sender),
            price: price,
            sold: false,
            businessDomain: businessDomain,
            comments: new string[](0),
            upvotes: 0,
            downvotes: 0,
            moderated: false,
            timestamp: block.timestamp,
            category: ""
        });

        _transfer(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            tokenId,
            msg.sender,
            address(this),
            price,
            false,
            businessDomain
        );
    }

    function fetchBusinessDomains() public view returns (string[] memory) {
        uint count = getRegisteredDomainCount();
        string[] memory businessDomains = new string[](count);
        uint currentIndex = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            string memory currentDomain = idToMarketItem[i].businessDomain;
            if (
                bytes(currentDomain).length > 0 &&
                registeredDomains[currentDomain]
            ) {
                businessDomains[currentIndex] = currentDomain;
                currentIndex++;
            }
        }

        return businessDomains;
    }

    function getRegisteredDomainCount() public view returns (uint) {
        uint count = 0;
        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (registeredDomains[idToMarketItem[i].businessDomain]) {
                count++;
            }
        }
        return count;
    }

    function fetchNFTsByDomain(
        string memory businessDomain
    ) public view returns (uint256[] memory) {
        return
            registeredDomains[businessDomain] &&
                bytes(businessDomain).length > 0
                ? getNFTsByDomain(businessDomain)
                : new uint256[](0);
    }

    function getNFTsByDomain(
        string memory businessDomain
    ) private view returns (uint256[] memory) {
        uint256[] memory nfts;
        uint count = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (
                bytes(idToMarketItem[i].businessDomain).length > 0 &&
                keccak256(abi.encodePacked(idToMarketItem[i].businessDomain)) ==
                keccak256(abi.encodePacked(businessDomain))
            ) {
                count++;
            }
        }

        nfts = new uint256[](count);
        uint currentIndex = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (
                bytes(idToMarketItem[i].businessDomain).length > 0 &&
                keccak256(abi.encodePacked(idToMarketItem[i].businessDomain)) ==
                keccak256(abi.encodePacked(businessDomain))
            ) {
                nfts[currentIndex] = idToMarketItem[i].tokenId;
                currentIndex++;
            }
        }

        return nfts;
    }

    function fetchUserNFTs() public view returns (uint256[] memory) {
        uint256[] memory userNFTs = new uint256[](_tokenIds.current());
        uint256 userNFTCount = 0;

        for (uint i = 1; i <= _tokenIds.current(); i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                userNFTs[userNFTCount] = idToMarketItem[i].tokenId;
                userNFTCount++;
            }
        }

        assembly {
            mstore(userNFTs, userNFTCount)
        }

        return userNFTs;
    }

    function upvoteReview(uint256 tokenId) public {
        require(idToMarketItem[tokenId].tokenId != 0, "Review does not exist");
        require(
            !hasUserVoted(tokenId),
            "User has already voted for this review"
        );

        idToMarketItem[tokenId].upvotes++;
        emit ReviewVoted(tokenId, msg.sender, true);
    }

    function downvoteReview(uint256 tokenId) public {
        require(idToMarketItem[tokenId].tokenId != 0, "Review does not exist");
        require(
            !hasUserVoted(tokenId),
            "User has already voted for this review"
        );

        idToMarketItem[tokenId].downvotes++;
        emit ReviewVoted(tokenId, msg.sender, false);
    }

    function getReviewDetails(
        uint256 tokenId
    )
        public
        view
        returns (
            string[] memory comments,
            uint256 upvotes,
            uint256 downvotes,
            bool moderated,
            uint256 timestamp,
            string memory category,
            string memory tokenURI,
            uint256 tokenid,
            address payable _seller,
            address payable _owner,
            uint _price,
            bool _sold
        )
    {
        MarketItem storage review = idToMarketItem[tokenId];
        return (
            review.comments,
            review.upvotes,
            review.downvotes,
            review.moderated,
            review.timestamp,
            review.category,
            review.tokenURI,
            review.tokenId,
            review.seller,
            review.owner,
            review.price,
            review.sold
        );
    }

    function hasUserVoted(uint256 tokenId) public view returns (bool) {
        MarketItem storage review = idToMarketItem[tokenId];
        return
            review.comments.length > 0 &&
            (review.upvotes > 0 || review.downvotes > 0);
    }

    function commentOnReview(uint256 tokenId, string memory comment) public {
        require(idToMarketItem[tokenId].tokenId != 0, "Review does not exist");
        // require(bytes(comment).length > 0, "Comment cannot be empty");

        idToMarketItem[tokenId].comments.push(comment);
    }

    function getBusinessDetailsByDomain(
        string memory businessDomain
    )
        public
        view
        returns (
            string memory username,
            bool isBusiness,
            string memory userBusinessDomain,
            string memory businessDescription,
            string memory businessCategory,
            uint256 reputation
        )
    {
        address userAddress = getUserAddressByDomain(businessDomain);

        User storage user = users[userAddress];

        return (
            user.username,
            user.isBusiness,
            user.businessDomain,
            user.businessDescription,
            user.businessCategory,
            user.reputation
        );
    }

    function getUserAddressByDomain(
        string memory businessDomain
    ) public view returns (address) {
        for (uint256 i = 0; i < Allusers.length; i++) {
            string memory tetsDomain = AlluserDomians[Allusers[i]];
            if (
                keccak256(bytes(tetsDomain)) == keccak256(bytes(businessDomain))
            ) {
                return Allusers[i];
            }
        }
        revert("No user found for the given business domain");
    }

    function buyNFT(uint256 tokenId) public payable {
        require(idToMarketItem[tokenId].tokenId != 0, "NFT does not exist");
        require(!idToMarketItem[tokenId].sold, "NFT already sold");
        require(
            msg.value >= idToMarketItem[tokenId].price,
            "Insufficient funds"
        );

        // Calculate the commission for the marketplace contract owner
        uint256 marketplaceOwnerShare = (idToMarketItem[tokenId].price *
            ownerCommissionPercentage) / 1000;
        // Transfer the payment (minus the marketplace owner's share) to the seller
        idToMarketItem[tokenId].seller.transfer(
            msg.value - marketplaceOwnerShare
        );
        // Transfer the marketplace owner's share to the marketplace contract owner
        payable(owner).transfer(marketplaceOwnerShare);

        // Transfer ownership of the NFT to the buyer
        idToMarketItem[tokenId].owner = payable(msg.sender);
        idToMarketItem[tokenId].seller = payable(msg.sender);
        // idToMarketItem[tokenId].sold = true;

        _transfer(address(this), msg.sender, tokenId);

        emit MarketItemSold(
            tokenId,
            idToMarketItem[tokenId].seller,
            msg.sender,
            idToMarketItem[tokenId].price
        );
    }

    function delistNFT(uint256 tokenId, string memory businessDomain) public {
        require(
            ownerOf(tokenId) == msg.sender,
            "You are not the owner of this NFT"
        );
        require(
            registeredDomains[businessDomain],
            "Business domain is not registered"
        );

        MarketItem storage marketItem = idToMarketItem[tokenId];
        require(
            keccak256(abi.encodePacked(marketItem.businessDomain)) ==
                keccak256(abi.encodePacked(businessDomain)),
            "NFT is not associated with this domain"
        );

        // Mark the NFT as sold (delisted) for this domain
        marketItem.sold = true;

        emit NFTDelisted(tokenId, businessDomain);
    }

    // Function to check if an address exists in the array
    function isUser(address checkAddress) public view returns (bool) {
        for (uint256 i = 0; i < Allusers.length; i++) {
            if (Allusers[i] == checkAddress) {
                return true; // Address exists in the array
            }
        }
        return false; // Address does not exist in the array
    }
}
