/**
 * Utility functions for formatting numbers and currencies.
 */

/**
 * Formats a number with dots as thousand separators and commas as decimal separators.
 * Example: 1234.56 -> "1.234,56"
 */
export const formatCurrency = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0,00';

  return num.toLocaleString('pt-PT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).replace(/\s/g, '.'); // Portuguese locale sometimes uses space, we want dot
};

/**
 * Formats a number with thousand separators but no decimals.
 * Example: 1234 -> "1.234"
 */
export const formatNumber = (value: number | string): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';

  return num.toLocaleString('pt-PT', {
    maximumFractionDigits: 0,
  }).replace(/\s/g, '.');
};
