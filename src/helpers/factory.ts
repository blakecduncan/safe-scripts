import getSigner from './getSigner';
import { ethers, ContractFactory, Contract } from 'ethers';
import * as SafeAccountFactory from '../contracts/SafeAccountFactory.json';
import * as Safe from '../contracts/Safe.json';
import * as SafeProxyFactory from '../contracts/SafeProxyFactory.json';
import * as EntryPoint from '../contracts/EntryPoint.json';
import * as Eip4337Manager from '../contracts/EIP4337Manager.json';
import {
  SAFE,
  SAFE_FACTORY,
  SAFE_ENTRY_POINT,
  EIP_4337_MANAGER,
} from '../constants';

const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/');

export async function getContracts() {
  const signer = getSigner();
  const manager = await get4337Manager(signer);
  const entryPoint = await getEntryPoint(signer);
  const safeSingleton = await getSafeSingleton(signer);
  const proxyFactory = await getFactory(signer);
  const accountFactory = await getSafeProxyFactory(
    proxyFactory.address,
    safeSingleton.address,
    manager.address,
  );
  return { manager, entryPoint, safeSingleton, proxyFactory, accountFactory };
}

export async function getSafeSingleton(signer: ethers.Signer) {
  const safeAddress = SAFE;
  return new Contract(safeAddress, Safe.abi, signer);
}

export async function getFactory(signer: ethers.Signer) {
  const factoryAddress = SAFE_FACTORY;
  return new Contract(factoryAddress, SafeProxyFactory.abi, signer);
}

export async function getEntryPoint(signer: ethers.Signer) {
  const entryPointAddress = SAFE_ENTRY_POINT;
  return new Contract(entryPointAddress, EntryPoint.abi, signer);
}

export async function get4337Manager(signer: ethers.Signer) {
  return new Contract(EIP_4337_MANAGER, Eip4337Manager.abi, signer);
}

function getSafeProxyFactory(
  proxyFactory: string,
  safeSingleton: string,
  manager: string,
) {
  const safeProxyFactory__Factory = new ContractFactory(
    SafeAccountFactory.abi,
    SafeAccountFactory.bytecode,
    getSigner(),
  );
  return safeProxyFactory__Factory.deploy(proxyFactory, safeSingleton, manager);
}

export async function getOwner(privateKey?: string) {
  const pk = privateKey ?? process.env.OWNER_1_PRIVATE_KEY ?? '';
  const owner = new ethers.Wallet(pk, provider);

  const ownerBalance = await provider.getBalance(owner.address);

  if (ownerBalance.gt(ethers.utils.parseEther('9.0'))) {
    console.log('Owner balance: ', ethers.utils.formatEther(ownerBalance));
    return owner;
  }

  console.log('Owner balance too low, funding owner...');
  // Send some ETH to the owner
  await getSigner()
    .sendTransaction({
      to: owner.address,
      value: ethers.utils.parseEther('10.0'),
    })
    .then(async (r: { wait: () => any }) => r.wait());

  return owner;
}

export async function isDeployed(addr: string): Promise<boolean> {
  const code = await provider.getCode(addr);
  return code.length > 2;
}
