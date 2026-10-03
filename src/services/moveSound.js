import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const player = createAudioPlayer(require('../../assets/sounds/move.wav'));
setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});

export function playMoveSound() {
  try {
    player.seekTo(0);
    player.play();
  } catch {
    // Sound is a small enhancement; a playback issue should never block a move.
  }
}
