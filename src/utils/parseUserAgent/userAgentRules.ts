export type Browser =
  | 'aol'
  | 'edge'
  | 'edge-ios'
  | 'yandexbrowser'
  | 'kakaotalk'
  | 'samsung'
  | 'silk'
  | 'miui'
  | 'beaker'
  | 'edge-chromium'
  | 'chrome'
  | 'chromium-webview'
  | 'phantomjs'
  | 'crios'
  | 'firefox'
  | 'fxios'
  | 'opera-mini'
  | 'opera'
  | 'ie'
  | 'bb10'
  | 'android'
  | 'ios'
  | 'safari'
  | 'facebook'
  | 'instagram'
  | 'ios-webview'
  | 'searchbot'
  | string;

export type UserAgentRule = [Browser, RegExp];

// eslint-disable-next-line max-len
const SEARCHBOX_UA_REGEX = /alexa|bot|crawl(er|ing)|facebookexternalhit|feedburner|google web preview|nagios|postrank|pingdom|slurp|spider|yahoo!|yandex/;

export const userAgentRules: UserAgentRule[] = [
  ['aol', /AOLShield\/([0-9._]+)/],
  ['edge', /Edge\/([0-9._]+)/],
  ['edge-ios', /EdgiOS\/([0-9._]+)/],
  ['yandexbrowser', /YaBrowser\/([0-9._]+)/],
  ['kakaotalk', /KAKAOTALK\s([0-9.]+)/],
  ['samsung', /SamsungBrowser\/([0-9.]+)/],
  ['silk', /\bSilk\/([0-9._-]+)\b/],
  ['miui', /MiuiBrowser\/([0-9.]+)$/],
  ['beaker', /BeakerBrowser\/([0-9.]+)/],
  ['edge-chromium', /Edg\/([0-9.]+)/],
  ['chromium-webview', /(?!Chrom.*OPR)wv\).*Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/],
  ['chrome', /(?!Chrom.*OPR)Chrom(?:e|ium)\/([0-9.]+)(:?\s|$)/],
  ['phantomJS', /PhantomJS\/([0-9.]+)(:?\s|$)/],
  ['crios', /CriOS\/([0-9.]+)(:?\s|$)/],
  ['firefox', /Firefox\/([0-9.]+)(?:\s|$)/],
  ['fxios', /FxiOS\/([0-9.]+)/],
  ['opera-mini', /Opera Mini.*Version\/([0-9.]+)/],
  ['opera', /Opera\/([0-9.]+)(?:\s|$)/],
  ['opera', /OPR\/([0-9.]+)(:?\s|$)/],
  ['ie', /Trident\/7\.0.*rv:([0-9.]+).*\).*Gecko$/],
  ['ie', /MSIE\s([0-9.]+);.*Trident\/[4-7].0/],
  ['ie', /MSIE\s(7\.0)/],
  ['bb10', /BB10;\sTouch.*Version\/([0-9.]+)/],
  ['android', /Android\s([0-9.]+)/],
  ['ios', /Version\/([0-9._]+).*Mobile.*Safari.*/],
  ['safari', /Version\/([0-9._]+).*Safari/],
  ['facebook', /FBAV\/([0-9.]+)/],
  ['instagram', /Instagram\s([0-9.]+)/],
  ['ios-webview', /AppleWebKit\/([0-9.]+).*Mobile/],
  ['ios-webview', /AppleWebKit\/([0-9.]+).*Gecko\)$/],
  ['searchbot', SEARCHBOX_UA_REGEX],
];
