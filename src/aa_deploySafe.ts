import getSigner from "./helpers/getSigner";
import { ethers } from "ethers";
import { hexConcat, parseEther } from 'ethers/lib/utils'
import { fillAndSign } from "./helpers/UserOp";
import { getOwner, getContracts, isDeployed } from "./helpers/factory";

const beneficiary = '0x6E60714FCC05a958803B2C0AB9Ae65acFfead135'

deploy4337Safe('1').then(() => console.log('Done!'))

async function deploy4337Safe(safeSalt: string) {
  const { accountFactory, entryPoint } = await getContracts()
  const owner = await getOwner()

  const initCode = hexConcat([
    accountFactory.address,
    accountFactory.interface.encodeFunctionData('createAccount', [owner.address, safeSalt])
  ])

  const counterfactualAddress = await accountFactory.callStatic.getAddress(owner.address, safeSalt)

  console.log('Counterfactual address: ', counterfactualAddress)

  if (await isDeployed(counterfactualAddress)) {
    console.log('Safe already deployed')
    return;
  }

  console.log('Funding safe counterfactual address...')
  await getSigner().sendTransaction({
    to: counterfactualAddress,
    value: parseEther('0.1')
  })

  console.log('Building UserOp...')
  const op = await fillAndSign({
    sender: counterfactualAddress,
    initCode,
    verificationGasLimit: 1e6,
    callGasLimit: 1e6,
  }, owner, entryPoint, 'getNonce')

  console.log('UserOp: ', op)

  console.log('Sending UserOp to entrypoint...')
  const rcpt = await entryPoint.handleOps([op], beneficiary).then(async (r: { wait: () => any; }) => r.wait())
  console.log('gasUsed=', rcpt.gasUsed)
  console.log('txHash=', rcpt.transactionHash)

  console.log('Safe is now deployed: ', await isDeployed(counterfactualAddress))
  console.log('Safe address: ', counterfactualAddress)
}