import { ethers } from "ethers";
import { GelatoRelay } from "@gelatonetwork/relay-sdk";
import { types, ERC20_ABI } from "./constant.js";
import dotenv from "dotenv";
dotenv.config();

// Load config
const {
  PRIVATE_KEY,
  RPC_URL,
  GELATO_RELAYER_API_KEY,
  CHAIN_ID,
  USDC_ADDRESS,
  RECIPIENT,
  SPENDER,
  AMOUNT,
} = process.env;

// Setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const token = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
const relay = new GelatoRelay({
  chainId: CHAIN_ID,
  apiKey: GELATO_RELAYER_API_KEY,
});
const TIMEOUT = 65000;

async function executePermitAndTransferUSDC() {
  try {
    // Get owner address and nonce
    const owner = await wallet.getAddress();
    const nonce = await token.nonces(owner);
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour

    // Create permit signature
    const domain = {
      name: "USD Coin",
      version: "2",
      chainId: CHAIN_ID,
      verifyingContract: USDC_ADDRESS,
    };

    const message = { owner, spender: SPENDER, value: AMOUNT, nonce, deadline };
    const signature = await wallet.signTypedData(domain, types, message);
    const { v, r, s } = ethers.Signature.from(signature);

    // Execute permit transaction
    const permitData = new ethers.Interface([
      "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s) external",
    ]).encodeFunctionData("permit", [
      owner,
      SPENDER,
      AMOUNT,
      deadline,
      v,
      r,
      s,
    ]);

    const permitTx = await relay.sponsoredCall(
      {
        chainId: CHAIN_ID,
        target: USDC_ADDRESS,
        data: permitData,
      },
      GELATO_RELAYER_API_KEY
    );

    console.log("Permit transaction:", permitTx);

    console.log("Waiting for 80 seconds for permit transaction to be mined...");
    await new Promise((resolve) => setTimeout(resolve, TIMEOUT)); // Wait 80s

    // Execute transfer transaction
    const transferData = new ethers.Interface([
      "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool)",
    ]).encodeFunctionData("transferFrom", [owner, RECIPIENT, AMOUNT]);

    const transferTx = await relay.sponsoredCall(
      {
        chainId: CHAIN_ID,
        target: USDC_ADDRESS,
        data: transferData,
      },
      GELATO_RELAYER_API_KEY
    );

    console.log("Transfer transaction:", transferTx);
    return { permitTx, transferTx };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Run
executePermitAndTransferUSDC().catch(console.error);
