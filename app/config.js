// 
// Файл констант приложения
// Удобно, особенно когда не помнишь везде ли поменял значение переменной 👍
// 

import Config from "react-native-config"

const host = Config.API_HOST || 'http://localhost'
const port = Config.API_PORT || 8000

export const URL = `${host}:${port}/api/v1`;

// URL телеграмм бота
export const TGURL = 'https://google.com'

