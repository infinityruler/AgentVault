// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import { MessageHashUtils } from "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import { ITransferProofVerifier } from "./interfaces/ITransferProofVerifier.sol";

error InvalidProof();
error ProofExpired();
error NonceAlreadyUsed();
error ZeroAddress();

contract MockTEEOracleVerifier is Ownable, ITransferProofVerifier {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    address public signer;
    mapping(bytes32 => bool) public usedNonces;

    event SignerUpdated(address indexed oldSigner, address indexed newSigner);
    event ProofConsumed(uint256 indexed tokenId, bytes32 indexed nonce, address indexed operator, address from, address to);

    constructor(address initialSigner, address initialOwner) Ownable(initialOwner) {
        if (initialSigner == address(0)) revert ZeroAddress();
        signer = initialSigner;
    }

    function setSigner(address newSigner) external onlyOwner {
        if (newSigner == address(0)) revert ZeroAddress();
        address oldSigner = signer;
        signer = newSigner;
        emit SignerUpdated(oldSigner, newSigner);
    }

    function buildPayloadHash(
        address operator,
        uint256 tokenId,
        address from,
        address to,
        bytes32 newMetadataHash,
        bytes32 newEncryptedBlobRoot,
        bytes32 newSealedKeyHash,
        bytes32 nonce,
        uint64 deadline
    ) public view returns (bytes32) {
        return keccak256(
            abi.encode(
                address(this),
                block.chainid,
                operator,
                tokenId,
                from,
                to,
                newMetadataHash,
                newEncryptedBlobRoot,
                newSealedKeyHash,
                nonce,
                deadline
            )
        );
    }

    function verifyTransferProof(
        uint256 tokenId,
        address from,
        address to,
        bytes32 newMetadataHash,
        bytes32 newEncryptedBlobRoot,
        bytes32 newSealedKeyHash,
        bytes calldata proof
    ) external override {
        (bytes32 nonce, uint64 deadline, bytes memory signature) = abi.decode(proof, (bytes32, uint64, bytes));
        if (usedNonces[nonce]) revert NonceAlreadyUsed();
        if (deadline < block.timestamp) revert ProofExpired();

        bytes32 payloadHash = buildPayloadHash(
            msg.sender,
            tokenId,
            from,
            to,
            newMetadataHash,
            newEncryptedBlobRoot,
            newSealedKeyHash,
            nonce,
            deadline
        );
        address recovered = payloadHash.toEthSignedMessageHash().recover(signature);
        if (recovered != signer) revert InvalidProof();

        usedNonces[nonce] = true;
        emit ProofConsumed(tokenId, nonce, msg.sender, from, to);
    }
}
