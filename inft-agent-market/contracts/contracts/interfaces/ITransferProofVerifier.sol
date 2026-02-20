// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ITransferProofVerifier {
    function verifyTransferProof(
        uint256 tokenId,
        address from,
        address to,
        bytes32 newMetadataHash,
        bytes32 newEncryptedBlobRoot,
        bytes32 newSealedKeyHash,
        bytes calldata proof
    ) external;
}
