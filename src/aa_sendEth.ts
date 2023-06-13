import { fillAndSign } from "./helpers/UserOp";
import { getContracts, isDeployed, getOwner } from "./helpers/factory";
import { ethers } from "ethers";

// Owner of the safe private key
const ownerPk = process.env.OWNER_1_PRIVATE_KEY
const safeAddress = '0x7D446006F86F9Ae8EF4a106E677Eb1A62c0aB909'
// The address to receive the fees
const beneficiary = '0x6E60714FCC05a958803B2C0AB9Ae65acFfead135'
// The address to send the ETH to
const to = '0xEe02D88A04671A563b1023782B18d90c2C06131a'
const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')

sendEth().then(() => console.log('Done!'))

async function sendEth() {
  const { entryPoint, manager } = await getContracts()

  if(!(await isDeployed(safeAddress))) {
    throw new Error('Safe not deployed')
  }

  const value = ethers.utils.parseEther('0.014')
  const data = '0x'

  const safe_execTxCallData = manager.interface.encodeFunctionData('executeAndRevert', [
    to,
    value,
    data,
    0
  ])

  const op = await fillAndSign({
    sender: safeAddress,
    callData: safe_execTxCallData,
    verificationGasLimit: 1e6,
    callGasLimit: 1e6,
  }, await getOwner(ownerPk), entryPoint)

  const safeBalanceBefore = await provider.getBalance(safeAddress)

  console.log(`${safeAddress} -> ${to} ${ethers.utils.formatEther(value)} ETH`);
  console.log('-----------')

  const rcpt = await entryPoint.handleOps([op], beneficiary).then(async (r: { wait: () => any; }) => r.wait())
  console.log('gasUsed=', rcpt.gasUsed)
  console.log('txHash=', rcpt.transactionHash)
  console.log('-----------')

  const safeBalanceAfter = await provider.getBalance(safeAddress)
  console.log(`Safe balance Before : ${ethers.utils.formatEther(safeBalanceBefore)} ETH`)
  console.log(`Safe balance After : ${ethers.utils.formatEther(safeBalanceAfter)} ETH`)
  console.log('-----------')
  
  const receiveAddress = await provider.getBalance(to)
  console.log(`To balance After : ${ethers.utils.formatEther(receiveAddress)} ETH`)

}