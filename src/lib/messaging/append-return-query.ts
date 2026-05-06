/** Append a query param without dropping existing search params on return paths like `/messages?agreement=…`. */
export function appendReturnQueryParam(path: string, key: string, value: string): string {
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}
