import * as dotenv from "dotenv";
import path from "path";
import { ethers } from "hardhat";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

async function main(): Promise<void> {
  const [deployer] = await ethers.getSigners();

  const oracleSignerAddress = process.env.ORACLE_SIGNER_ADDRESS || deployer.address;
  const feeRecipient = process.env.FEE_RECIPIENT || deployer.address;
  const defaultRoyaltyRecipient = process.env.DEFAULT_ROYALTY_RECIPIENT || deployer.address;
  const defaultRoyaltyBps = Number(process.env.DEFAULT_ROYALTY_BPS || "500");
  const protocolFeeBps = Number(process.env.PROTOCOL_FEE_BPS || "200");

  console.log("Deployer:", deployer.address);
  console.log("Oracle signer:", oracleSignerAddress);

  const verifierFactory = await ethers.getContractFactory("MockTEEOracleVerifier");
  const verifier = await verifierFactory.deploy(oracleSignerAddress, deployer.address);
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("MockTEEOracleVerifier:", verifierAddress);

  const inftFactory = await ethers.getContractFactory("AgentINFT");
  const inft = await inftFactory.deploy(
    "AgentVault INFT",
    "AVINFT",
    verifierAddress,
    deployer.address,
    defaultRoyaltyRecipient,
    defaultRoyaltyBps
  );
  await inft.waitForDeployment();
  const inftAddress = await inft.getAddress();
  console.log("AgentINFT:", inftAddress);

  const marketFactory = await ethers.getContractFactory("AgentMarketplace");
  const market = await marketFactory.deploy(inftAddress, feeRecipient, protocolFeeBps, deployer.address);
  await market.waitForDeployment();
  const marketAddress = await market.getAddress();
  console.log("AgentMarketplace:", marketAddress);

  console.log("\nDeployment complete.");
  console.log(`INFT=${inftAddress}`);
  console.log(`MARKET=${marketAddress}`);
  console.log(`VERIFIER=${verifierAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
