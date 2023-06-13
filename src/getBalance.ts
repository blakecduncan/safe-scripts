import { ethers } from "ethers";

const address = '0x83415A53f05CEEadB1C4f4a6338D7eB342270fe2'

run()

async function run() {
  //Get the balance of the given address
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
  const balance = await provider.getBalance(address)
  console.log(`${address} : ${ethers.utils.formatEther(balance)} ETH`)
}