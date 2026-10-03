import { useCallback, useEffect } from 'react';
import { DeviceEventEmitter, NativeModules } from 'react-native';

const nativeEngine = NativeModules.ReactNativeStockfish || null;
const stateKey = '__CHESS_COACH_STOCKFISH_STATE__';
const state = globalThis[stateKey] || (globalThis[stateKey] = {
  running: false,
  outputListeners: new Set(),
  errorListeners: new Set(),
  outputSubscription: null,
  errorSubscription: null,
});

// This native module has one process-wide engine and its reader coroutines cannot
// be restarted after stopStockfish(). Keep its event bridge alive across screen
// unmounts and Fast Refresh; only the screen callbacks are temporary.
if (nativeEngine && !state.outputSubscription) {
  state.outputSubscription = DeviceEventEmitter.addListener('stockfish-output', (output) => {
    state.outputListeners.forEach((listener) => listener(output));
  });
  state.errorSubscription = DeviceEventEmitter.addListener('stockfish-error', (error) => {
    state.errorListeners.forEach((listener) => listener(error));
  });
}

export const hasNativeStockfish = Boolean(nativeEngine);

export function useStockfishEngine({ onOutput, onError }) {
  useEffect(() => {
    if (onOutput) state.outputListeners.add(onOutput);
    if (onError) state.errorListeners.add(onError);
    return () => {
      if (onOutput) state.outputListeners.delete(onOutput);
      if (onError) state.errorListeners.delete(onError);
    };
  }, [onOutput, onError]);

  const stockfishLoop = useCallback(() => {
    if (!nativeEngine || state.running) return;
    state.running = true;
    try {
      nativeEngine.stockfishLoop();
    } catch (error) {
      state.running = false;
      throw error;
    }
  }, []);

  const sendCommandToStockfish = useCallback((command) => {
    if (nativeEngine && state.running) nativeEngine.sendCommandToStockfish(command);
  }, []);

  // The library's native stop is terminal for this module instance, so app
  // screen cleanup must not call it. Android/iOS closes the engine on process exit.
  const stopStockfish = useCallback(() => {}, []);

  return { stockfishLoop, stopStockfish, sendCommandToStockfish };
}
