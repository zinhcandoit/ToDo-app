export function safeParseJSON<T = unknown>(s: string): T | null {
    try { return JSON.parse(s) as T } catch { return null }
}
