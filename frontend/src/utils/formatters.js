/**
 * Utility formatters for SchoolERP
 * Consistent currency (₹), date formatting, and tabular figures
 */

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const formatShortDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export const calculateAge = (dobString) => {
  if (!dobString) return '';
  const dob = new Date(dobString);
  if (isNaN(dob.getTime())) return '';
  const diffMs = Date.now() - dob.getTime();
  const ageDt = new Date(diffMs);
  const years = Math.abs(ageDt.getUTCFullYear() - 1970);
  const months = ageDt.getUTCMonth();
  return `${years}y ${months}m`;
};
