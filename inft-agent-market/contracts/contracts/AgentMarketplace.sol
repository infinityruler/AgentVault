// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Address } from "@openzeppelin/contracts/utils/Address.sol";
import { IERC2981 } from "@openzeppelin/contracts/interfaces/IERC2981.sol";
import { AgentINFT } from "./AgentINFT.sol";

error InvalidAddress();
error InvalidPrice();
error InvalidFee();
error ListingInactive();
error ListingExpired();
error NotListingSeller();
error NotTokenOwner();
error NotApprovedForMarketplace();
error InsufficientPayment();
error RoyaltyExceedsSalePrice();
error ListingStale();

contract AgentMarketplace is Ownable, ReentrancyGuard {
    struct Listing {
        address seller;
        uint96 price;
        uint64 expiresAt;
        bool active;
    }

    uint96 public constant BPS_DENOMINATOR = 10_000;
    uint96 public constant MAX_FEE_BPS = 1_000;

    AgentINFT public immutable agentINFT;
    address public feeRecipient;
    uint96 public feeBps;

    mapping(uint256 => Listing) public listings;

    event Listed(uint256 indexed tokenId, address indexed seller, uint256 price, uint64 expiresAt);
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);
    event Purchased(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 salePrice,
        uint256 protocolFee,
        uint256 royaltyAmount
    );
    event FeeBpsUpdated(uint96 oldFeeBps, uint96 newFeeBps);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);

    constructor(address inftAddress, address initialFeeRecipient, uint96 initialFeeBps, address initialOwner)
        Ownable(initialOwner)
    {
        if (inftAddress == address(0) || initialFeeRecipient == address(0)) revert InvalidAddress();
        if (initialFeeBps > MAX_FEE_BPS) revert InvalidFee();

        agentINFT = AgentINFT(inftAddress);
        feeRecipient = initialFeeRecipient;
        feeBps = initialFeeBps;
    }

    function listToken(uint256 tokenId, uint96 price, uint64 expiresAt) external {
        if (price == 0) revert InvalidPrice();
        if (expiresAt != 0 && expiresAt <= block.timestamp) revert ListingExpired();
        if (agentINFT.ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (!_isMarketplaceApproved(msg.sender, tokenId)) revert NotApprovedForMarketplace();

        listings[tokenId] = Listing({ seller: msg.sender, price: price, expiresAt: expiresAt, active: true });
        emit Listed(tokenId, msg.sender, price, expiresAt);
    }

    function cancelListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert ListingInactive();
        if (listing.seller != msg.sender && owner() != msg.sender) revert NotListingSeller();

        delete listings[tokenId];
        emit ListingCancelled(tokenId, listing.seller);
    }

    function buyToken(
        uint256 tokenId,
        bytes32 newMetadataHash,
        bytes32 newEncryptedBlobRoot,
        bytes32 newSealedKeyHash,
        string calldata newEncryptedURI,
        bytes calldata oracleProof
    ) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        if (!listing.active) revert ListingInactive();
        if (listing.expiresAt != 0 && listing.expiresAt < block.timestamp) revert ListingExpired();
        if (msg.value < listing.price) revert InsufficientPayment();
        if (agentINFT.ownerOf(tokenId) != listing.seller) revert ListingStale();
        if (!_isMarketplaceApproved(listing.seller, tokenId)) revert NotApprovedForMarketplace();

        delete listings[tokenId];

        uint256 salePrice = listing.price;
        uint256 protocolFee = (salePrice * feeBps) / BPS_DENOMINATOR;

        (address royaltyReceiver, uint256 royaltyAmount) = IERC2981(address(agentINFT)).royaltyInfo(tokenId, salePrice);
        if (royaltyReceiver == listing.seller) {
            royaltyAmount = 0;
        }
        if (royaltyReceiver == address(0)) {
            royaltyAmount = 0;
        }
        if (protocolFee + royaltyAmount > salePrice) revert RoyaltyExceedsSalePrice();

        uint256 sellerAmount = salePrice - protocolFee - royaltyAmount;

        if (protocolFee > 0) {
            Address.sendValue(payable(feeRecipient), protocolFee);
        }
        if (royaltyAmount > 0) {
            Address.sendValue(payable(royaltyReceiver), royaltyAmount);
        }
        Address.sendValue(payable(listing.seller), sellerAmount);

        agentINFT.transferWithMetadata(
            msg.sender,
            tokenId,
            newMetadataHash,
            newEncryptedBlobRoot,
            newSealedKeyHash,
            newEncryptedURI,
            oracleProof
        );

        if (msg.value > salePrice) {
            Address.sendValue(payable(msg.sender), msg.value - salePrice);
        }

        emit Purchased(tokenId, listing.seller, msg.sender, salePrice, protocolFee, royaltyAmount);
    }

    function setFeeBps(uint96 newFeeBps) external onlyOwner {
        if (newFeeBps > MAX_FEE_BPS) revert InvalidFee();
        uint96 oldFeeBps = feeBps;
        feeBps = newFeeBps;
        emit FeeBpsUpdated(oldFeeBps, newFeeBps);
    }

    function setFeeRecipient(address newFeeRecipient) external onlyOwner {
        if (newFeeRecipient == address(0)) revert InvalidAddress();
        address oldRecipient = feeRecipient;
        feeRecipient = newFeeRecipient;
        emit FeeRecipientUpdated(oldRecipient, newFeeRecipient);
    }

    function _isMarketplaceApproved(address tokenOwner, uint256 tokenId) internal view returns (bool) {
        return agentINFT.getApproved(tokenId) == address(this)
            || agentINFT.isApprovedForAll(tokenOwner, address(this));
    }
}
