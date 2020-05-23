/* eslint-disable max-classes-per-file */

import { Browser } from './userAgentRules';
import { OperatingSystem } from './osRules';

import { createVersionParts } from './createVersionParts';
import { matchUserAgent } from './matchUserAgent';
import { detectOS } from './detectOS';

export type DetectedInfoType = 'browser' | 'node' | 'bot-device' | 'bot';

interface DetectedInfo<T extends DetectedInfoType, N extends string, O, V = null> {
  readonly type: T;
  readonly name: N;
  readonly version: V;
  readonly os: O;
}

export class BrowserInfo implements DetectedInfo<'browser', Browser, OperatingSystem, string> {
  public readonly type = 'browser';

  constructor(
    public readonly name: Browser,
    public readonly version: string,
    public readonly os: OperatingSystem,
  ) {}
}

export class SearchBotDeviceInfo implements DetectedInfo<'bot-device', Browser, OperatingSystem, string> {
  public readonly type = 'bot-device';

  constructor(
    public readonly name: Browser,
    public readonly version: string,
    public readonly os: OperatingSystem,
    public readonly bot: string,
  ) {}
}

export class BotInfo implements DetectedInfo<'bot', 'bot', 'Unknown', 'Unknown'> {
  public readonly type = 'bot';

  public readonly bot: true = true; // NOTE: deprecated test name instead

  public readonly name: 'bot' = 'bot';

  public readonly version: 'Unknown' = 'Unknown';

  public readonly os: 'Unknown' = 'Unknown';
}

const SEARCHBOT_OS_REGEX = /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/;
const REQUIRED_VERSION_PARTS = 3;

export function detect(ua: string): BrowserInfo | SearchBotDeviceInfo | BotInfo {
  const matchedRule = matchUserAgent(ua);

  if (!matchedRule) {
    return new BrowserInfo('Unknown Browser', '', 'Unknown OS');
  }

  const [name, match] = matchedRule;

  if (name === 'searchbot') {
    return new BotInfo();
  }

  const version = createVersionParts(match[1], REQUIRED_VERSION_PARTS);
  const os = detectOS(ua);
  const searchBotMatch = SEARCHBOT_OS_REGEX.exec(ua);

  if (searchBotMatch && searchBotMatch[1]) {
    return new SearchBotDeviceInfo(name, version, os, searchBotMatch[1]);
  }

  return new BrowserInfo(name, version, os);
}
