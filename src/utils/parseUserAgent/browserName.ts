import { Browser } from './userAgentRules';
import { matchUserAgent } from './matchUserAgent';

function browserName(ua: string): Browser | null {
  const data = matchUserAgent(ua);

  return data ? data[0] : null;
}

export default browserName;
