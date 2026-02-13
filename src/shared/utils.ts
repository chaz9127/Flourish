// Extract domain from URL
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
}

// Normalize domain (remove www., lowercase)
export function normalizeDomain(domain: string): string {
  return domain.replace(/^www\./, '').toLowerCase();
}

// Check if current domain matches a pattern domain
// Supports subdomain matching: sub.example.com matches example.com
export function domainMatches(currentDomain: string, patternDomain: string): boolean {
  const normalizedCurrent = normalizeDomain(currentDomain);
  const normalizedPattern = normalizeDomain(patternDomain);

  // Exact match
  if (normalizedCurrent === normalizedPattern) {
    return true;
  }

  // Subdomain match
  if (normalizedCurrent.endsWith('.' + normalizedPattern)) {
    return true;
  }

  return false;
}

// Validate if a string is a valid domain
export function isValidDomain(domain: string): boolean {
  // Basic domain validation regex
  const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
  const normalizedDomain = normalizeDomain(domain);

  return domainRegex.test(normalizedDomain);
}

// Extract domain from user input (handles URLs or plain domains)
export function extractDomainFromInput(input: string): string | null {
  const trimmedInput = input.trim();

  // If it looks like a URL, extract the domain
  if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
    const domain = extractDomain(trimmedInput);
    return domain ? normalizeDomain(domain) : null;
  }

  // Otherwise, treat it as a domain
  const normalizedDomain = normalizeDomain(trimmedInput);

  // Validate the domain
  if (isValidDomain(normalizedDomain)) {
    return normalizedDomain;
  }

  return null;
}
