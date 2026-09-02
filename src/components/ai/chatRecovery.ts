/** Build the login URL that returns the user to the page where chat expired. */
export function getChatLoginUrl(currentPath: string): string {
  const callbackPath = currentPath.startsWith("/") ? currentPath : "/dashboard";
  return `/login?callbackUrl=${encodeURIComponent(callbackPath)}`;
}
