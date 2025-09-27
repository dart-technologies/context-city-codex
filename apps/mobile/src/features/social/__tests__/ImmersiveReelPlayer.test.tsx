import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ImmersiveReelPlayer } from '../ImmersiveReelPlayer';
import { felixNarrative } from '../../../mocks/felix';

jest.mock('expo-video', () => {
  const React = require('react');
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
    VideoView: (props: any) => <mock-video {...props} />,
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

describe('ImmersiveReelPlayer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('toggles transcript visibility and locale', () => {
    const { getByText, queryByText } = render(
      <ImmersiveReelPlayer narrative={felixNarrative} autoPlay={false} onClose={jest.fn()} locale="en" />
    );

    expect(queryByText(/Dartagnan here/i)).toBeNull();

    fireEvent.press(getByText('Show transcript'));
    expect(getByText(/Dartagnan here/i)).toBeTruthy();

    fireEvent.press(getByText('ES'));
    expect(getByText(/¡Soy Dartagnan/i)).toBeTruthy();
  });

  it('invokes playback controls and analytics', async () => {
    const analytics = jest.fn();
    const { getByText, findByText } = render(
      <ImmersiveReelPlayer
        narrative={felixNarrative}
        autoPlay={false}
        onClose={jest.fn()}
        locale="en"
        onAnalytics={analytics}
      />
    );

    expect(analytics).toHaveBeenNthCalledWith(1, 'player.view', expect.any(Object));
    expect(getByText('Play')).toBeTruthy();

    fireEvent.press(getByText('Play'));

    expect(await findByText('Pause')).toBeTruthy();
    expect(analytics).toHaveBeenNthCalledWith(2, 'player.play', expect.any(Object));

    fireEvent.press(getByText('Pause'));

    expect(await findByText('Play')).toBeTruthy();
    expect(analytics).toHaveBeenNthCalledWith(3, 'player.pause', expect.any(Object));
  });
});
