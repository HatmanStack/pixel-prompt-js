import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const click = require('../assets/click.wav');
const swoosh = require('../assets/swoosh.mp3');
const switchSound = require('../assets/switch.wav');
const expand = require('../assets/expand.wav');

const SoundPlayer = ({ makeSound}) => {
  const soundRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
    });
    return () => {
      // Unload the sound when the component unmounts
      if (soundRef.current) {
        soundRef.current?.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const playSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        // Dynamically select the sound file based on makeSound
        { uri: makeSound[0] === 'click' ? click : makeSound[0] === 'swoosh' ? swoosh : makeSound[0] === 'switch' ? switchSound : expand },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      await sound.playAsync();
    };

    if (makeSound) {
      playSound();
    }
  }, [makeSound]);

  return null;
};

export default SoundPlayer;