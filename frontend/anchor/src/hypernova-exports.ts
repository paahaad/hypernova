// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import HypernovaIDL from '../target/idl/hypernova.json'
import type { Hypernova } from '../target/types/hypernova'
import { isMainnetEnvironment } from '@/config/environment'

// Re-export the generated IDL and type
export { Hypernova, HypernovaIDL }

// The programId is imported from the program IDL.
export const HYPERNOVA_PROGRAM_ID = new PublicKey(HypernovaIDL.address)

// This is a helper function to get the Hypernova Anchor program.
export function getHypernovaProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...HypernovaIDL, address: address ? address.toBase58() : HypernovaIDL.address } as Hypernova, provider)
}

// This is a helper function to get the program ID for the Hypernova program depending on the cluster.
export function getHypernovaProgramId() {
  if (isMainnetEnvironment()) {
    // This is the program ID for the Hypernova program on mainnet
    return HYPERNOVA_PROGRAM_ID
  } else {
    // This is the program ID for the Hypernova program on devnet and testnet.
    return new PublicKey('HeQRZFKyhr1DG7MV3FxrrrBTPqjyVCWSS6KiUhxUyrcb')
  }
}

// For compatibility with existing code
export function getHypernovaProgramIdLegacy(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Hypernova program on devnet and testnet.
      return new PublicKey('HeQRZFKyhr1DG7MV3FxrrrBTPqjyVCWSS6KiUhxUyrcb')
    case 'mainnet-beta':
    default:
      return HYPERNOVA_PROGRAM_ID
  }
}
