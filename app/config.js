// 
// Файл констант приложения
// Удобно, особенно когда не помнишь везде ли поменял значение переменной 👍
// 
const host = process.env.EXPO_PUBLIC_API_HOST || 'http://localhost'
const port = process.env.EXPO_PUBLIC_API_PORT || 8000

export const URL = `${host}:${port}/api/v1`;

// URL телеграмм бота
export const TGURL = 'https://google.com'

