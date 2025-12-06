// Service for fetching service logos from multiple sources
// Implements fallback strategy for maximum logo availability

export class LogoService {
  // Cache to avoid repeated fetches for the same service
  private static logoCache: Map<string, string> = new Map();

  // Priority order for logo fetching
  private static readonly LOGO_SOURCES = [
    'clearbit',    // Best quality, requires domain
    'google',      // Fallback, always available
    'duckduckgo',  // Alternative fallback
    'local'        // Generate from first letter
  ];

  /**
   * Fetch logo for a service by name or URL
   * @param serviceName - Name of the service (e.g., "Netflix")
   * @param websiteUrl - Optional website URL
   * @returns Promise<string> - Logo URL or data URI
   */
  static async fetchLogo(
    serviceName: string, 
    websiteUrl?: string
  ): Promise<string> {
    // Check cache first
    const cacheKey = `${serviceName}-${websiteUrl || ''}`;
    if (this.logoCache.has(cacheKey)) {
      return this.logoCache.get(cacheKey)!;
    }

    let logoUrl: string;

    // 1. Extract domain from website URL
    const domain = this.extractDomain(websiteUrl);
    
    // 2. Try Clearbit Logo API (best quality)
    if (domain) {
      const clearbitLogo = await this.tryClearbit(domain);
      if (clearbitLogo) {
        logoUrl = clearbitLogo;
        this.logoCache.set(cacheKey, logoUrl);
        return logoUrl;
      }
    }
    
    // 3. Try Google Favicon (reliable fallback)
    if (domain) {
      logoUrl = this.getGoogleFavicon(domain);
      this.logoCache.set(cacheKey, logoUrl);
      return logoUrl;
    }
    
    // 4. Try DuckDuckGo Icon API (alternative)
    if (domain) {
      const ddgLogo = await this.tryDuckDuckGo(domain);
      if (ddgLogo) {
        logoUrl = ddgLogo;
        this.logoCache.set(cacheKey, logoUrl);
        return logoUrl;
      }
    }
    
    // 5. Generate letter avatar as final fallback
    logoUrl = this.generateLetterAvatar(serviceName);
    this.logoCache.set(cacheKey, logoUrl);
    return logoUrl;
  }

  /**
   * Extract domain from URL string
   */
  private static extractDomain(url?: string): string | null {
    if (!url) return null;
    try {
      // Add protocol if missing
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const urlObj = new URL(fullUrl);
      return urlObj.hostname.replace('www.', '');
    } catch {
      return null;
    }
  }

  /**
   * Try Clearbit Logo API (https://clearbit.com/logo)
   * Free tier: unlimited logos
   */
  private static async tryClearbit(domain: string): Promise<string | null> {
    try {
      const url = `https://logo.clearbit.com/${domain}`;
      // Use HEAD request to check if logo exists
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok ? url : null;
    } catch {
      return null;
    }
  }

  /**
   * Google Favicon API - always returns something (even if generic)
   */
  private static getGoogleFavicon(domain: string): string {
    // sz=128 for higher resolution
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }

  /**
   * Try DuckDuckGo Icon API
   */
  private static async tryDuckDuckGo(domain: string): Promise<string | null> {
    try {
      const url = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok ? url : null;
    } catch {
      return null;
    }
  }

  /**
   * Generate letter avatar as fallback
   * Creates an SVG with the first letter of the service name
   */
  private static generateLetterAvatar(name: string): string {
    const letter = name.charAt(0).toUpperCase();
    const colors = [
      '#ef4444', '#3b82f6', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
    ];
    // Use name length to pick a consistent color
    const color = colors[name.length % colors.length];
    
    const svg = `
      <svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
        <rect width="128" height="128" fill="${color}" rx="16"/>
        <text x="50%" y="50%" 
              text-anchor="middle" 
              dy=".35em" 
              fill="white" 
              font-size="64" 
              font-weight="bold" 
              font-family="system-ui, -apple-system, sans-serif">
          ${letter}
        </text>
      </svg>
    `.trim();
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  }

  /**
   * Preload logo (optional - for better UX)
   * Can be called when user starts typing a service name
   */
  static preloadLogo(serviceName: string, websiteUrl?: string): void {
    this.fetchLogo(serviceName, websiteUrl).catch(() => {
      // Silently fail preloading
    });
  }

  /**
   * Clear cache (useful for testing or memory management)
   */
  static clearCache(): void {
    this.logoCache.clear();
  }

  /**
   * Get cached logo without fetching
   */
  static getCachedLogo(serviceName: string, websiteUrl?: string): string | null {
    const cacheKey = `${serviceName}-${websiteUrl || ''}`;
    return this.logoCache.get(cacheKey) || null;
  }
}
