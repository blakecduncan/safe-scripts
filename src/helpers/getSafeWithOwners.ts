import { Contract, ContractFactory, ethers } from 'ethers';
import * as Safe from '../contracts/Safe.json';
import * as SafeProxyFactory from '../contracts/SafeProxyFactory.json';
import * as EntryPoint from '../contracts/EntryPoint.json';
import * as Eip4337Manager from '../contracts/EIP4337Manager.json';
import { AddressZero } from '@ethersproject/constants';
import {
  SAFE,
  SAFE_FACTORY,
  SAFE_ENTRY_POINT,
  EIP_4337_MANAGER,
} from '../constants';
import { getOwner } from './factory';

async function getSafeWithOwners(
  owners: string[],
  threshold?: number,
  fallbackHandler?: string,
  logGasUsage?: boolean,
  saltNumber: string = getRandomIntAsString(),
) {
  const template = await getSafeTemplate(saltNumber);
  await logGas(
    `Setup Safe with ${owners.length} owner(s)${
      fallbackHandler && fallbackHandler !== AddressZero
        ? ' and fallback handler'
        : ''
    }`,
    template.setup(
      owners,
      threshold || owners.length,
      AddressZero,
      '0x',
      fallbackHandler || AddressZero,
      AddressZero,
      0,
      AddressZero,
    ),
    !logGasUsage,
  );
  return template;
}

async function getSafeTemplate(saltNumber: string = getRandomIntAsString()) {
  const signer = await getOwner();
  const singleton = await getSafeSingleton(signer);
  const factory = await getFactory(signer);
  const template = await factory.callStatic.createProxyWithNonce(
    singleton.address,
    '0x',
    saltNumber,
  );
  await factory
    .createProxyWithNonce(singleton.address, '0x', saltNumber)
    .then((tx: any) => tx.wait());
  const safe = new ContractFactory(Safe.abi, Safe.bytecode, signer);
  return safe.attach(template);
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

function getRandomIntAsString(
  min = 0,
  max: number = Number.MAX_SAFE_INTEGER,
): string {
  return getRandomInt(min, max).toString();
}

function getRandomInt(min = 0, max: number = Number.MAX_SAFE_INTEGER): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function logGas(
  message: string,
  tx: Promise<any>,
  skip?: boolean,
): Promise<any> {
  return tx.then(async (result) => {
    const receipt = await result.wait();
    if (!skip)
      console.log(
        '           Used',
        receipt.gasUsed.toNumber(),
        `gas for >${message}<`,
      );
    return result;
  });
}

export default getSafeWithOwners;
