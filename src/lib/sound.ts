import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { captureException } from './monitoring';

export const SIREN = require('../../assets/sounds/siren.wav');
export const RINGTONE = require('../../assets/sounds/ringtone.wav');

/** Plays a sound on repeat at full volume, even with the iPhone's silent switch on. */
export async function playLoop(source: number): Promise<AudioPlayer | null> {
  try {
    await setAudioModeAsync({ playsInSilentMode: true });
    const player = createAudioPlayer(source);
    player.loop = true;
    player.volume = 1;
    player.play();
    return player;
  } catch (error) {
    captureException(error, 'sound-play');
    return null;
  }
}

export function stopLoop(player: AudioPlayer | null) {
  if (!player) return;
  try {
    player.pause();
    player.remove();
  } catch (error) {
    captureException(error, 'sound-stop');
  }
}
