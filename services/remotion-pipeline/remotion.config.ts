import {cpus} from 'os';
import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setCodec('h264');
Config.setConcurrency(Math.max(1, cpus().length - 1));
