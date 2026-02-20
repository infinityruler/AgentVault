import { expect } from "chai";
import { ethers } from "hardhat";
import type { Contract, Signer } from "ethers";

type ProofBundle = {
  nonce: string;
  deadline: bigint;
  proof: string;
};

async function buildProof(
  verifier: Contract,
  inftAddress: string,
  tokenId: bigint,
  from: string,
  to: string,
  newMetadataHash: string,
  newEncryptedBlobRoot: string,
  newSealedKeyHash: string,
  signer: Signer
): Promise<ProofBundle> {
  const nonce = ethers.hexlify(ethers.randomBytes(32));
  const latestBlock = await ethers.provider.getBlock("latest");
  const deadline = BigInt((latestBlock?.timestamp ?? 0) + 3600);
  const payloadHash = await verifier.buildPayloadHash(
    inftAddress,
    tokenId,
    from,
    to,
    newMetadataHash,
    newEncryptedBlobRoot,
    newSealedKeyHash,
    nonce,
    deadline
  );
  const signature = await signer.signMessage(ethers.getBytes(payloadHash));
  const proof = ethers.AbiCoder.defaultAbiCoder().encode(
    ["bytes32", "uint64", "bytes"],
    [nonce, deadline, signature]
  );

  return { nonce, deadline, proof };
}

describe("AgentVault contracts", () => {
  let verifier: Contract;
  let inft: Contract;
  let market: Contract;
  let deployer: Signer;
  let creator: Signer;
  let buyer: Signer;
  let lessee: Signer;
  let feeRecipient: Signer;
  let oracleSigner: Signer;

  beforeEach(async () => {
    [deployer, creator, buyer, lessee, feeRecipient, oracleSigner] = await ethers.getSigners();

    const verifierFactory = await ethers.getContractFactory("MockTEEOracleVerifier");
    verifier = await verifierFactory.deploy(await oracleSigner.getAddress(), await deployer.getAddress());
    await verifier.waitForDeployment();

    const inftFactory = await ethers.getContractFactory("AgentINFT");
    inft = await inftFactory.deploy(
      "AgentVault INFT",
      "AVINFT",
      await verifier.getAddress(),
      await deployer.getAddress(),
      await creator.getAddress(),
      500
    );
    await inft.waitForDeployment();

    const marketFactory = await ethers.getContractFactory("AgentMarketplace");
    market = await marketFactory.deploy(
      await inft.getAddress(),
      await feeRecipient.getAddress(),
      200,
      await deployer.getAddress()
    );
    await market.waitForDeployment();
  });

  it("mints agent metadata and manages usage grants", async () => {
    const mintTx = await inft
      .connect(creator)
      .mintAgent(
        await creator.getAddress(),
        ethers.keccak256(ethers.toUtf8Bytes("meta-1")),
        ethers.keccak256(ethers.toUtf8Bytes("root-1")),
        ethers.keccak256(ethers.toUtf8Bytes("key-1")),
        "zg://encrypted/1",
        750
      );
    await mintTx.wait();

    const tokenId = 1n;
    const commitment = await inft.getMetadataCommitment(tokenId);
    expect(commitment.version).to.equal(1);
    expect(await inft.ownerOf(tokenId)).to.equal(await creator.getAddress());
    expect(await inft.tokenURI(tokenId)).to.equal("zg://encrypted/1");

    const latestBlock = await ethers.provider.getBlock("latest");
    const expiry = BigInt((latestBlock?.timestamp ?? 0) + 3600);
    const permsHash = ethers.keccak256(ethers.toUtf8Bytes("chat-only"));

    await inft.connect(creator).authorizeUsage(tokenId, await lessee.getAddress(), expiry, permsHash);
    expect(await inft.hasValidUsage(tokenId, await lessee.getAddress())).to.equal(true);

    await inft.connect(creator).revokeUsage(tokenId, await lessee.getAddress());
    expect(await inft.hasValidUsage(tokenId, await lessee.getAddress())).to.equal(false);
  });

  it("lists and buys with proof-backed metadata transfer", async () => {
    const mintTx = await inft
      .connect(creator)
      .mintAgent(
        await creator.getAddress(),
        ethers.keccak256(ethers.toUtf8Bytes("meta-original")),
        ethers.keccak256(ethers.toUtf8Bytes("root-original")),
        ethers.keccak256(ethers.toUtf8Bytes("key-original")),
        "zg://encrypted/original",
        500
      );
    await mintTx.wait();

    const tokenId = 1n;
    const leaseExpiry = BigInt((await ethers.provider.getBlock("latest"))!.timestamp + 4000);
    await inft
      .connect(creator)
      .authorizeUsage(tokenId, await lessee.getAddress(), leaseExpiry, ethers.keccak256(ethers.toUtf8Bytes("lease")));

    await inft.connect(creator).approve(await market.getAddress(), tokenId);
    const listingExpiry = BigInt((await ethers.provider.getBlock("latest"))!.timestamp + 1000);
    const price = ethers.parseEther("1");
    await market.connect(creator).listToken(tokenId, price, listingExpiry);

    const newMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("meta-new"));
    const newEncryptedBlobRoot = ethers.keccak256(ethers.toUtf8Bytes("root-new"));
    const newSealedKeyHash = ethers.keccak256(ethers.toUtf8Bytes("key-new"));
    const proofBundle = await buildProof(
      verifier,
      await inft.getAddress(),
      tokenId,
      await creator.getAddress(),
      await buyer.getAddress(),
      newMetadataHash,
      newEncryptedBlobRoot,
      newSealedKeyHash,
      oracleSigner
    );

    const buyTx = await market
      .connect(buyer)
      .buyToken(
        tokenId,
        newMetadataHash,
        newEncryptedBlobRoot,
        newSealedKeyHash,
        "zg://encrypted/new",
        proofBundle.proof,
        { value: price }
      );
    await buyTx.wait();

    expect(await inft.ownerOf(tokenId)).to.equal(await buyer.getAddress());
    expect(await inft.hasValidUsage(tokenId, await lessee.getAddress())).to.equal(false);
    expect(await verifier.usedNonces(proofBundle.nonce)).to.equal(true);

    const commitment = await inft.getMetadataCommitment(tokenId);
    expect(commitment.metadataHash).to.equal(newMetadataHash);
    expect(commitment.version).to.equal(2);
    expect(await inft.tokenURI(tokenId)).to.equal("zg://encrypted/new");
  });

  it("rejects replayed oracle nonces", async () => {
    const mintTx = await inft
      .connect(creator)
      .mintAgent(
        await creator.getAddress(),
        ethers.keccak256(ethers.toUtf8Bytes("meta-replay")),
        ethers.keccak256(ethers.toUtf8Bytes("root-replay")),
        ethers.keccak256(ethers.toUtf8Bytes("key-replay")),
        "zg://encrypted/replay",
        0
      );
    await mintTx.wait();

    const tokenId = 1n;
    const newMetadataHash = ethers.keccak256(ethers.toUtf8Bytes("meta-next"));
    const newEncryptedBlobRoot = ethers.keccak256(ethers.toUtf8Bytes("root-next"));
    const newSealedKeyHash = ethers.keccak256(ethers.toUtf8Bytes("key-next"));

    const proofBundle = await buildProof(
      verifier,
      await inft.getAddress(),
      tokenId,
      await creator.getAddress(),
      await buyer.getAddress(),
      newMetadataHash,
      newEncryptedBlobRoot,
      newSealedKeyHash,
      oracleSigner
    );

    await inft
      .connect(creator)
      .transferWithMetadata(
        await buyer.getAddress(),
        tokenId,
        newMetadataHash,
        newEncryptedBlobRoot,
        newSealedKeyHash,
        "zg://encrypted/next",
        proofBundle.proof
      );

    await expect(
      inft
        .connect(buyer)
        .transferWithMetadata(
          await creator.getAddress(),
          tokenId,
          ethers.keccak256(ethers.toUtf8Bytes("meta-third")),
          ethers.keccak256(ethers.toUtf8Bytes("root-third")),
          ethers.keccak256(ethers.toUtf8Bytes("key-third")),
          "zg://encrypted/third",
          proofBundle.proof
        )
    ).to.be.revertedWithCustomError(verifier, "NonceAlreadyUsed");
  });
});
