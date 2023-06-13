import { BigNumber, } from "ethers";
import { AddressZero } from "@ethersproject/constants";

export interface MetaTransaction {
  to: string;
  value: string | number | BigNumber;
  data: string;
  operation: number;
}

export interface SafeTransaction extends MetaTransaction {
  safeTxGas: string | number;
  baseGas: string | number;
  gasPrice: string | number;
  gasToken: string;
  refundReceiver: string;
  nonce: string | number;
}

function  buildSafeTransaction (template: {
  to: string;
  value?: BigNumber | number | string;
  data?: string;
  operation?: number;
  safeTxGas?: number | string;
  baseGas?: number | string;
  gasPrice?: number | string;
  gasToken?: string;
  refundReceiver?: string;
  nonce: number;
}): SafeTransaction {
  return {
      to: template.to,
      value: template.value || 0,
      data: template.data || "0x",
      operation: template.operation || 0,
      safeTxGas: template.safeTxGas || 0,
      baseGas: template.baseGas || 0,
      gasPrice: template.gasPrice || 0,
      gasToken: template.gasToken || AddressZero,
      refundReceiver: template.refundReceiver || AddressZero,
      nonce: template.nonce,
  };
};

export default buildSafeTransaction;