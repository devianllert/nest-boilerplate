/**
 * Format version string
 */
export const createVersionParts = (version: string, count: number = 3): string => {
  const parts = version.split(/[._]/).slice(0, count);
  const partsCount = parts.length;

  for (let i = 0; i < count - partsCount; i += 1) {
    parts.push('0');
  }

  return parts.join('.');
};
