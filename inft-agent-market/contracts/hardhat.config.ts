import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const deployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const sharedAccounts = deployerPrivateKey ? [deployerPrivateKey] : [];

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {},
    galileo: {
      chainId: Number(process.env.OG_CHAIN_ID ?? "16602"),
      url: process.env.OG_RPC_URL ?? "https://evmrpc-testnet.0g.ai",
      accounts: sharedAccounts
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  mocha: {
    timeout: 120000
  }
};

export default config;
