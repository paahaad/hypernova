import { createKeyPairSignerFromBytes } from '@solana/kit';
import fs from 'fs';


async function loadWallet() {
  const keyPairBytes = new Uint8Array(JSON.parse(fs.readFileSync('/home/parvat/project/hypernova.fun/frontend/orca/wallet.json', 'utf8')));
  const wallet = await createKeyPairSignerFromBytes(keyPairBytes);
  return wallet;
}

export default loadWallet();