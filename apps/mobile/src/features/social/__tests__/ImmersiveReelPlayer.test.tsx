import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Vibration } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ImmersiveReelPlayer } from '../ImmersiveReelPlayer';
import { felixNarrative } from '../../../mocks/felix';

jest.mock('expo-video', () => {
  const React = require('react');
  const { View } = require('react-native');
  const createPlayer = () => {
    const listeners = new Map();
    return {
      playing: false,
      play: jest.fn(function () {
        this.playing = true;
        listeners.get('playingChange')?.({ isPlaying: true });
      }),
      pause: jest.fn(function () {
        this.playing = false;
        listeners.get('playingChange')?.({ isPlaying: false });
      }),
      addListener: jest.fn((event, handler) => {
        listeners.set(event, handler);
        return { remove: () => listeners.delete(event) };
      }),
    };
  };
  let lastPlayer: any = null;
  return {
    __esModule: true,
    VideoView: (props: any) => <View testID="mock-video" {...props} />,
    useVideoPlayer: jest.fn((source: any, setup?: (player: any) => void) => {
      if (!lastPlayer) {
        lastPlayer = createPlayer();
        setup?.(lastPlayer);
      } else {
        setup?.(lastPlayer);
      }
      return lastPlayer;
    }),
    __getLastPlayer: () => lastPlayer,
  };
});

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => () => undefined),
}));

const mockPlayAsync = jest.fn(async () => undefined);
const mockStopAsync = jest.fn(async () => undefined);
const mockUnloadAsync = jest.fn(async () => undefined);
const mockSetOnPlaybackStatusUpdate = jest.fn();

jest.mock('expo-audio', () => ({
  __esModule: true,
  Audio: {
    Sound: {
      createAsync: jest.fn(async () => ({
        sound: {
          playAsync: mockPlayAsync,
          stopAsync: mockStopAsync,
          unloadAsync: mockUnloadAsync,
          pauseAsync: jest.fn(async () => undefined),
          setOnPlaybackStatusUpdate: mockSetOnPlaybackStatusUpdate,
        },
      })),
    },
  },
}), { virtual: true });

describe('ImmersiveReelPlayer', () => {
  let vibrateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    vibrateSpy = jest.spyOn(Vibration, 'vibrate').mockImplementation(() => undefined);
    mockPlayAsync.mockReset();
    mockStopAsync.mockReset();
    mockUnloadAsync.mockReset();
    mockSetOnPlaybackStatusUpdate.mockReset();
  });

  afterEach(() => {
    vibrateSpy.mockRestore();
  });

  const renderWithSafeArea = (ui: React.ReactNode) =>
    render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        {ui}
      </SafeAreaProvider>
    );

  it('toggles transcript visibility and locale', async () => {
    const { getByLabelText, getByText, queryByText } = renderWithSafeArea(
      <ImmersiveReelPlayer narrative={felixNarrative} autoPlay={false} onClose={jest.fn()} locale="en" />
    );

    expect(queryByText(/Dartagnan here/i)).toBeNull();

    fireEvent.press(await waitFor(() => getByLabelText('Show transcript')));
    expect(getByText(/Dartagnan here/i)).toBeTruthy();

    fireEvent.press(getByText('🇪🇸'));
    expect(getByText(/¡Soy Dartagnan/i)).toBeTruthy();
  });

  it('invokes playback controls and analytics', async () => {
    const analytics = jest.fn();
    const { getByLabelText, getByText } = renderWithSafeArea(
      <ImmersiveReelPlayer
        narrative={felixNarrative}
        autoPlay={false}
        onClose={jest.fn()}
        locale="en"
        onAnalytics={analytics}
      />
    );

    await waitFor(() => expect(analytics).toHaveBeenCalledWith('player.view', expect.any(Object)));
    const playButton = await waitFor(() => getByLabelText('Play reel'));

    fireEvent.press(playButton);

    const pauseButton = await waitFor(() => getByLabelText('Pause reel'));
    expect(analytics).toHaveBeenNthCalledWith(2, 'player.play', expect.any(Object));

    fireEvent.press(pauseButton);

    await waitFor(() => getByLabelText('Play reel'));
    expect(analytics).toHaveBeenNthCalledWith(3, 'player.pause', expect.any(Object));
  });

  it('surfaces accessibility options and triggers haptic cue', async () => {
    const analytics = jest.fn();
    const { getByLabelText, getByText, getAllByText } = renderWithSafeArea(
      <ImmersiveReelPlayer
        narrative={felixNarrative}
        autoPlay={false}
        onClose={jest.fn()}
        locale="en"
        onAnalytics={analytics}
      />
    );

    fireEvent.press(await waitFor(() => getByLabelText('Show accessibility options')));
    expect(getByText('Accessibility')).toBeTruthy();
    expect(getByText(/Audio descriptions/i)).toBeTruthy();

    const [feelCueButton] = getAllByText('Feel cue');
    fireEvent.press(feelCueButton);
    expect(vibrateSpy).toHaveBeenCalled();
    expect(analytics).toHaveBeenCalledWith('accessibility.haptic_triggered', expect.objectContaining({ locale: 'en' }));

    const [playButton] = getAllByText('Play');
    fireEvent.press(playButton);
    await waitFor(() => expect(analytics).toHaveBeenCalledWith('accessibility.audio_description_played', expect.objectContaining({ locale: 'en' })));
    expect(mockPlayAsync).toHaveBeenCalled();
  });
});
