import { ethers } from "ethers";
import getSafeWithOwners from "./helpers/getSafeWithOwners";
import sendEth from "./helpers/sendEth";
import buildSafeTransaction from "./helpers/buildSafeTransaction";
import executeTxWithSigners from "./helpers/executeTxWithSigners";

run();

async function run() {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')

  try {
    const signer = getSigner()
    console.log('Deploying Safe...')
    const safe = await getSafeWithOwners([signer.address]);
    console.log('Safe deployed at address: ', safe.address)

    console.log('Sending 10 ETH to Safe...')
    await sendEth(safe.address, '10')

    console.log('Send 2 eth from safe to another address...')

    const nonce = await safe.nonce();
    const toAddress = '0x6E60714FCC05a958803B2C0AB9Ae65acFfead135';
    const tx = buildSafeTransaction({
      to: toAddress,
      value: ethers.utils.parseEther("2"),
      nonce
    });

    console.log('To balance before: ', ethers.utils.formatEther(await provider.getBalance(toAddress)))

    await executeTxWithSigners(safe, tx, [signer]);

    console.log('To balance after: ', ethers.utils.formatEther(await provider.getBalance(toAddress)))
  } catch(e) {
    console.log(e)
  }
}

function getSigner() {
  const pk = process.env.HARDHAT_FUNDED_PRIVATE_KEY ?? ''
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
  return new ethers.Wallet(pk, provider)
}
