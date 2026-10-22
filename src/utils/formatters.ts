/**
 * Formats a number as Indian Currency (INR, ₹)
 * Supports standard Indian numbering format (e.g. ₹1,50,000.00)
 */
export function formatINR(value: number, showDecimals = true): string {
  if (isNaN(value) || !isFinite(value)) {
    return '₹0';
  }

  const isNegative = value < 0;
  const absValue = Math.abs(value);
  const fixed = absValue.toFixed(showDecimals ? 2 : 0);
  const parts = fixed.split('.');
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Indian numbering system: last 3 digits, then groups of 2 digits
  let lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInteger =
    otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

  const result = showDecimals && decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  return `${isNegative ? '-' : ''}₹${result}`;
}

/**
 * Formats a percentage value (e.g. 15.5%)
 */
export function formatPct(value: number, decimals = 1): string {
  if (isNaN(value) || !isFinite(value)) return '0.0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Parse string to safe positive number (defaults to 0)
 */
export function parseNumber(val: string | number, min = 0): number {
  if (typeof val === 'number') {
    return isNaN(val) || !isFinite(val) ? min : Math.max(min, val);
  }
  if (!val || val.trim() === '') return min;
  const cleaned = val.replace(/,/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) || !isFinite(parsed) ? min : Math.max(min, parsed);
}

/**
 * Rounding charm pricing:
 * e.g. 487 -> round to nearest 9 ending (₹489 or ₹499), 5 ending, 10 ending
 */
export function roundCharmPrice(price: number, option: 'none' | '1' | '5' | '9' | '10'): number {
  if (option === 'none' || price <= 0) return Math.round(price);
  
  if (option === '1') {
    return Math.round(price);
  }
  
  if (option === '5') {
    return Math.round(price / 5) * 5;
  }

  if (option === '10') {
    return Math.round(price / 10) * 10;
  }

  if (option === '9') {
    // Round to end in 9 or 99 (e.g. 482 -> 489 or 499)
    const base = Math.floor(price / 10) * 10;
    const candidate = base + 9;
    return candidate < price ? candidate + 10 : candidate;
  }

  return Math.round(price);
}
