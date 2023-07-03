import { ethers } from 'ethers';

async function sendEth(address: string, amount: string) {
  try {
    const pk = process.env.HARDHAT_FUNDED_PRIVATE_KEY ?? '';

    const provider = new ethers.providers.JsonRpcProvider(
      'http://127.0.0.1:8545/',
    );
    const wallet = new ethers.Wallet(pk, provider);

    console.log(`${wallet.address} -> ${address} ${amount} ETH`);

    const txnRes = await wallet.sendTransaction({
      to: address,
      value: ethers.utils.parseEther(amount),
    });
    await txnRes.wait();
    console.log(`$${amount} ETH sent to ${address}`);
  } catch (e) {
    console.log(e);
  }
}

export default sendEth;
