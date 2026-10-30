// Must be imported first (App.tsx line 1). Required by @solana/web3.js + MWA.
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

(global as unknown as { Buffer: typeof Buffer }).Buffer =
  (global as unknown as { Buffer?: typeof Buffer }).Buffer ?? Buffer;
