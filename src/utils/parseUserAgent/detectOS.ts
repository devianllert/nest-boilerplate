import { osRules, OperatingSystem } from './osRules';

export const detectOS = (ua: string): OperatingSystem => {
  for (let ii = 0, count = osRules.length; ii < count; ii += 1) {
    const [os, regex] = osRules[ii];
    const match = regex.exec(ua);

    if (match) return os;
  }

  return 'Unknown OS';
};
