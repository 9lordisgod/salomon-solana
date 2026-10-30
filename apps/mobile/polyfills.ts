// Copyright (c) 2026 Anon Rothschild. All rights reserved. Proprietary.
// Must be imported first (App.tsx line 2). Required by @solana/web3.js + MWA on React Native.
import 'react-native-get-random-values';
import { Buffer } from 'buffer';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).Buffer = (global as any).Buffer ?? Buffer;
