import { ethers } from "ethers";

const address = '0xEe02D88A04671A563b1023782B18d90c2C06131a'

run()

async function run() {
  //Get the balance of the given address
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
  const balance = await provider.getBalance(address)
  console.log(`${address} : ${ethers.utils.formatEther(balance)} ETH`)
}