export function makeId(): string {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        // Một số phiên bản TypeScript chưa có định nghĩa randomUUID
        // nên thêm @ts-expect-error để tránh cảnh báo
        // @ts-expect-error
        return crypto.randomUUID()
    }
    // fallback: kết hợp timestamp + random
    return (
        Date.now().toString(36) +
        Math.random().toString(36).substring(2, 8)
    ).toUpperCase()
}

