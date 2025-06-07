import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import TrackPlayer, {
  Capability,
  State,
  usePlaybackState,
} from 'react-native-track-player';
import Slider from '@react-native-community/slider';

const App = () => {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const playbackState = usePlaybackState();

  useEffect(() => {
    setupPlayer();
    return () => {
      TrackPlayer.destroy();
    };
  }, []);

  const setupPlayer = async () => {
    await TrackPlayer.setupPlayer();
    TrackPlayer.updateOptions({
      stopWithApp: true,
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.Stop,
      ],
    });
  };

  const pickAudioFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/mpeg',
      copyToCacheDirectory: true,
    });

    if (!result.canceled) {
      const file = result.assets[0];
      const newTrack = {
        id: Date.now().toString(),
        url: file.uri,
        title: file.name,
        artist: 'Unknown Artist',
      };
      setTracks([newTrack]);
      await TrackPlayer.reset();
      await TrackPlayer.add([newTrack]);
    }
  };

  const playTrack = async (trackId) => {
    await TrackPlayer.skip(trackId);
    await TrackPlayer.play();
    setCurrentTrack(trackId);
  };

  const togglePlayback = async () => {
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const skipToNext = async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (_) {
      console.log('No next track available');
    }
  };

  const skipToPrevious = async () => {
    try {
      await TrackPlayer.skipToPrevious();
    } catch (_) {
      console.log('No previous track available');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music Player</Text>

      <TouchableOpacity style={styles.pickButton} onPress={pickAudioFile}>
        <Text style={styles.pickText}>🎵 Pick MP3 File</Text>
      </TouchableOpacity>

      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => playTrack(item.id)}>
            <Text style={styles.track}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.controls}>
        <TouchableOpacity onPress={skipToPrevious}>
          <Text style={styles.controlText}>⏮️</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlayback}>
          <Text style={styles.controlText}>
            {playbackState === State.Playing ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={skipToNext}>
          <Text style={styles.controlText}>⏭️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#1db954',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  track: {
    color: '#fff',
    padding: 10,
  },
  pickButton: {
    backgroundColor: '#1db954',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  pickText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    marginVertical: 15,
  },
  controlText: {
    fontSize: 22,
    color: 'white',
    marginHorizontal: 20,
  },
});

export default App;
