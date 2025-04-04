export const appConfig = {
  useMockData: false,
  apiBaseUrl: import.meta.env.MODE === 'production' 
    ? 'https://api.example.com'
    : 'http://localhost:3001',
  defaultPaginationLimit: 10,
}; 