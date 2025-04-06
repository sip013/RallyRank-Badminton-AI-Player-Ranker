/**
 * Utility functions for handling paths in the application
 */

/**
 * Get the base URL for the application
 * This is used for resolving static assets and navigation
 */
export const getBaseUrl = (): string => {
  // Check if we're in production (GitHub Pages)
  if (import.meta.env.PROD) {
    // Get the current pathname
    const pathname = window.location.pathname;
    
    // Extract the repository name from the pathname
    // Format: /username/repository-name/
    const match = pathname.match(/^\/([^\/]+)\/([^\/]+)/);
    
    if (match) {
      // Return the full base path including the repository name
      return `/${match[1]}/${match[2]}`;
    }
  }
  
  // Default to root path for development
  return '';
};

/**
 * Resolve a path relative to the base URL
 * @param path The path to resolve
 * @returns The resolved path
 */
export const resolvePath = (path: string): string => {
  const baseUrl = getBaseUrl();
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Combine base URL and path
  return `${baseUrl}${normalizedPath}`;
}; 