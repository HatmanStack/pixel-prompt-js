import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

const click = require('../assets/click.wav');
const swoosh = require('../assets/swoosh.mp3');
const switchSound = require('../assets/switch.wav');
const expand = require('../assets/expand.wav');
import useAppStore from '../store/appStore';

const SoundPlayer = () => {
  const makeSound = useAppStore((state) => state.makeSound);
  const soundRef = useRef(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true
    });
    return () => {
      if (soundRef.current) {
        soundRef.current?.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    const playSound = async () => {
      // Get the correct sound file directly without using uri
      const soundFile = makeSound[0] === 'click' 
        ? click 
        : makeSound[0] === 'swoosh' 
        ? swoosh 
        : makeSound[0] === 'switch' 
        ? switchSound 
        : expand;

      try {
        const { sound } = await Audio.Sound.createAsync(
          soundFile,
          { shouldPlay: true }
        );
        soundRef.current = sound;
        await sound.playAsync();
      } catch (error) {
        console.error('Error playing sound:', error, soundFile);
      }
    };

    if (makeSound) {
      playSound();
    }
  }, [makeSound]);

  return null;
};

export default SoundPlayer;