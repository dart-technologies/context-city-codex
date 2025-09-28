import {Composition} from 'remotion';
import {CodexHighlightVideo} from './templates/CodexHighlightVideo';
import {CodexHighlightProps} from './types';
import sampleNarrative from '../examples/sample-narrative.json';

export const CodexHighlightRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CodexHighlightVideo"
        component={CodexHighlightVideo}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={sampleNarrative as CodexHighlightProps}
      />
    </>
  );
};
