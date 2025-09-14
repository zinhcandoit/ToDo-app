export function makeId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }
    // fallback: kết hợp timestamp + random
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    ).toUpperCase()
}

