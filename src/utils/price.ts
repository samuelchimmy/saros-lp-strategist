export const getPriceFromId = (
    bin_step: number,
    bin_id: number,
    baseTokenDecimal: number,
    quoteTokenDecimal: number
): number => {
    // This is a JS-safe implementation of the Saros SDK's price formula.
    const base = 1 + bin_step / 10000;
    const exponent = bin_id - 8388608;
    const decimalPow = Math.pow(10, baseTokenDecimal - quoteTokenDecimal);
    const price = Math.pow(base, exponent) * decimalPow;
    return price;
}
EOF```

**7. `src/utils/token.ts`**
```bash
cat << 'EOF' > src/utils/token.ts
export const calculateTokenAmount = (
  amount: string | number | bigint,
  decimals: number
): number => {
  if (typeof amount === 'undefined' || typeof decimals === 'undefined') {
    return 0;
  }
  return Number(amount) / Math.pow(10, decimals);
};
