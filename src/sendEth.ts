import { ethers } from "ethers";

async function run() {
  try {
    const pk = process.env.HARDHAT_FUNDED_PRIVATE_KEY ?? ''

    // Send to this address
    const amount = '4'
    const address = '0x83415A53f05CEEadB1C4f4a6338D7eB342270fe2'

    const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
    const wallet = new ethers.Wallet(pk, provider)

    console.log(`${wallet.address} -> ${address} ${amount} ETH`);

    const txnRes = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
    });
    await txnRes.wait();
    console.log('done')
  } catch (e) {
    console.log(e)
  }
}

run()