// Currency conversion utilities
// Primary currency: CVE (Escudo Cabo-Verdiano)
// Secondary currency: EUR (Euro)
// Fixed exchange rate: 1 EUR = 110.265 CVE

const CVE_TO_EUR_RATE = 110.265;

/**
 * Convert CVE to EUR
 */
export function cveToEur(cve: number): number {
  return cve / CVE_TO_EUR_RATE;
}

/**
 * Convert EUR to CVE
 */
export function eurToCve(eur: number): number {
  return eur * CVE_TO_EUR_RATE;
}

/**
 * Format CVE amount
 */
export function formatCVE(amount: number): string {
  return `${amount.toLocaleString('pt-CV')} CVE`;
}

/**
 * Format EUR amount
 */
export function formatEUR(amount: number): string {
  return `${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/**
 * Format price with both CVE (primary) and EUR (secondary)
 */
export function formatPrice(amountCVE: number, showEur: boolean = true): string {
  const cve = formatCVE(amountCVE);
  if (!showEur) return cve;
  
  const eur = formatEUR(cveToEur(amountCVE));
  return `${cve} (${eur})`;
}

/**
 * Component-friendly price display
 * Returns object with formatted values for flexible rendering
 */
export function getPriceDisplay(amountCVE: number) {
  return {
    cve: amountCVE,
    eur: cveToEur(amountCVE),
    formattedCVE: formatCVE(amountCVE),
    formattedEUR: formatEUR(cveToEur(amountCVE)),
    combined: formatPrice(amountCVE),
  };
}
