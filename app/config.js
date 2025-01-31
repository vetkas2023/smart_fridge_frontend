// 
// Файл констант приложения
// Удобно, особенно когда не помнишь везде ли поменял значение переменной 👍
// 
const host = process.env.EXPO_PUBLIC_API_HOST || 'http://localhost'
const port = process.env.EXPO_PUBLIC_API_PORT || 8000

export const URL = `${host}:${port}`;

// URL телеграмм бота
export const bot_name = process.env.EXPO_PUBLIC_BOT_NAME || 'tesicules_pvz_bot'

