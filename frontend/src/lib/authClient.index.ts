import { mockAuthClient, realAuthClient } from './authClient'
export const authClient = import.meta.env.VITE_USE_MOCK_AUTH === "true" ? mockAuthClient : realAuthClient;