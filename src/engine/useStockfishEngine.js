import { useEffect } from 'react';
let useNativeStockfish = null;
try { useNativeStockfish = require('@loloof64/react-native-stockfish').useStockfish; } catch { /* Expo Go has no Stockfish native module. */ }
export const hasNativeStockfish = Boolean(useNativeStockfish);
export function useStockfishEngine({ onOutput, onError }) {
  if (useNativeStockfish) return useNativeStockfish({ onOutput, onError });
  useEffect(() => {}, []);
  return { stockfishLoop: () => {}, stopStockfish: () => {}, sendCommandToStockfish: () => {} };
}
