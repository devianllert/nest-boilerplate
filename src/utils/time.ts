/**
 * Get the seconds timestamp of the given date.
 */
const getUnixTimestamp = (date: Date | string | number): number => Math.floor(new Date(date).getTime() / 1000);

/**
 * Create a date from a Unix timestamp.
 */
const fromUnixTimestamp = (timestamp: number): Date => new Date(timestamp * 1000);

export {
  getUnixTimestamp,
  fromUnixTimestamp,
};
