// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { ERC721URIStorage } from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { ERC2981 } from "@openzeppelin/contracts/token/common/ERC2981.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ITransferProofVerifier } from "./interfaces/ITransferProofVerifier.sol";

error InvalidAddress();
error UnauthorizedTransfer();
error NotTokenOwner();
error InvalidExpiry();
error InvalidRoyaltyBps();

contract AgentINFT is ERC721URIStorage, ERC2981, Ownable {
    struct MetadataCommitment {
        bytes32 metadataHash;
        bytes32 encryptedBlobRoot;
        bytes32 sealedKeyHash;
        uint64 version;
    }

    struct UsageGrant {
        uint64 expiry;
        bytes32 permsHash;
        uint64 epoch;
    }

    uint96 public constant MAX_ROYALTY_BPS = 10_000;

    uint256 private _nextTokenId;
    address public oracleVerifier;

    mapping(uint256 => MetadataCommitment) private _commitments;
    mapping(uint256 => mapping(address => UsageGrant)) private _usageGrants;
    mapping(uint256 => uint64) public usageEpoch;

    event AgentMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        bytes32 metadataHash,
        bytes32 encryptedBlobRoot,
        bytes32 sealedKeyHash
    );
    event MetadataTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        bytes32 metadataHash,
        bytes32 encryptedBlobRoot,
        bytes32 sealedKeyHash,
        uint64 version
    );
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed owner,
        address indexed user,
        uint64 expiry,
        bytes32 permsHash,
        uint64 epoch
    );
    event UsageRevoked(uint256 indexed tokenId, address indexed owner, address indexed user, uint64 epoch);
    event OracleVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOracleVerifier,
        address initialOwner,
        address defaultRoyaltyRecipient,
        uint96 defaultRoyaltyBps
    ) ERC721(name_, symbol_) Ownable(initialOwner) {
        if (initialOracleVerifier == address(0)) revert InvalidAddress();
        if (defaultRoyaltyBps > MAX_ROYALTY_BPS) revert InvalidRoyaltyBps();

        oracleVerifier = initialOracleVerifier;
        if (defaultRoyaltyRecipient != address(0) && defaultRoyaltyBps > 0) {
            _setDefaultRoyalty(defaultRoyaltyRecipient, defaultRoyaltyBps);
        }
    }

    function setOracleVerifier(address newVerifier) external onlyOwner {
        if (newVerifier == address(0)) revert InvalidAddress();
        address oldVerifier = oracleVerifier;
        oracleVerifier = newVerifier;
        emit OracleVerifierUpdated(oldVerifier, newVerifier);
    }

    function mintAgent(
        address to,
        bytes32 metadataHash,
        bytes32 encryptedBlobRoot,
        bytes32 sealedKeyHash,
        string calldata encryptedURI,
        uint96 royaltyBps
    ) external returns (uint256 tokenId) {
        if (to == address(0)) revert InvalidAddress();
        if (royaltyBps > MAX_ROYALTY_BPS) revert InvalidRoyaltyBps();

        tokenId = ++_nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, encryptedURI);

        _commitments[tokenId] = MetadataCommitment({
            metadataHash: metadataHash,
            encryptedBlobRoot: encryptedBlobRoot,
            sealedKeyHash: sealedKeyHash,
            version: 1
        });

        if (royaltyBps > 0) {
            _setTokenRoyalty(tokenId, msg.sender, royaltyBps);
        }

        emit AgentMinted(tokenId, msg.sender, to, metadataHash, encryptedBlobRoot, sealedKeyHash);
    }

    function transferWithMetadata(
        address to,
        uint256 tokenId,
        bytes32 newMetadataHash,
        bytes32 newEncryptedBlobRoot,
        bytes32 newSealedKeyHash,
        string calldata newEncryptedURI,
        bytes calldata oracleProof
    ) external {
        if (to == address(0)) revert InvalidAddress();
        if (!_isOwnerOrApproved(msg.sender, tokenId)) revert UnauthorizedTransfer();

        address from = ownerOf(tokenId);
        ITransferProofVerifier(oracleVerifier).verifyTransferProof(
            tokenId,
            from,
            to,
            newMetadataHash,
            newEncryptedBlobRoot,
            newSealedKeyHash,
            oracleProof
        );

        MetadataCommitment storage commitment = _commitments[tokenId];
        commitment.metadataHash = newMetadataHash;
        commitment.encryptedBlobRoot = newEncryptedBlobRoot;
        commitment.sealedKeyHash = newSealedKeyHash;
        commitment.version += 1;

        usageEpoch[tokenId] += 1;
        _setTokenURI(tokenId, newEncryptedURI);
        _transfer(from, to, tokenId);

        emit MetadataTransferred(
            tokenId,
            from,
            to,
            newMetadataHash,
            newEncryptedBlobRoot,
            newSealedKeyHash,
            commitment.version
        );
    }

    function authorizeUsage(uint256 tokenId, address user, uint64 expiry, bytes32 permsHash) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        if (user == address(0)) revert InvalidAddress();
        if (expiry <= block.timestamp) revert InvalidExpiry();

        uint64 epoch = usageEpoch[tokenId];
        _usageGrants[tokenId][user] = UsageGrant({ expiry: expiry, permsHash: permsHash, epoch: epoch });
        emit UsageAuthorized(tokenId, msg.sender, user, expiry, permsHash, epoch);
    }

    function revokeUsage(uint256 tokenId, address user) external {
        if (ownerOf(tokenId) != msg.sender) revert NotTokenOwner();
        delete _usageGrants[tokenId][user];
        emit UsageRevoked(tokenId, msg.sender, user, usageEpoch[tokenId]);
    }

    function getMetadataCommitment(uint256 tokenId) external view returns (MetadataCommitment memory) {
        _requireOwned(tokenId);
        return _commitments[tokenId];
    }

    function usageDetails(uint256 tokenId, address user) external view returns (UsageGrant memory) {
        return _usageGrants[tokenId][user];
    }

    function hasValidUsage(uint256 tokenId, address user) public view returns (bool) {
        address tokenOwner = _ownerOf(tokenId);
        if (tokenOwner == address(0)) return false;
        if (tokenOwner == user) return true;

        UsageGrant memory grant = _usageGrants[tokenId][user];
        return grant.epoch == usageEpoch[tokenId] && grant.expiry >= block.timestamp;
    }

    function _isOwnerOrApproved(address spender, uint256 tokenId) internal view returns (bool) {
        address tokenOwner = ownerOf(tokenId);
        return spender == tokenOwner || getApproved(tokenId) == spender || isApprovedForAll(tokenOwner, spender);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
