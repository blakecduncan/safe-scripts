import { ethers } from 'ethers';

export default function getSigner() {
  const pk = process.env.HARDHAT_FUNDED_PRIVATE_KEY ?? '';
  const provider = new ethers.providers.JsonRpcProvider(
    'http://127.0.0.1:8545/',
  );
  return new ethers.Wallet(pk, provider);
}
