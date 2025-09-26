export const calculateTokenAmount = (
  amount: string | number | bigint,
  decimals: number
): number => {
  if (typeof amount === 'undefined' || typeof decimals === 'undefined') {
    return 0;
  }
  return Number(amount) / Math.pow(10, decimals);
};
