import { userAgentRules, Browser } from './userAgentRules';

export type UserAgentMatch = [Browser, RegExpExecArray] | false;

export const matchUserAgent = (ua: string): UserAgentMatch => (
  // opted for using reduce here rather than Array#first with a regex.test call
  // this is primarily because using the reduce we only perform the regex
  // execution once rather than once for the test and for the exec again below
  // probably something that needs to be benchmarked though

  ua !== '' && userAgentRules.reduce<UserAgentMatch>((matched: UserAgentMatch, [browser, regex]) => {
    if (matched) return matched;

    const uaMatch = regex.exec(ua);

    return !!uaMatch && [browser, uaMatch];
  }, false)
);
