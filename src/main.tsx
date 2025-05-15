
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { StoresProvider } from './context/StoresContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LocaleProvider } from './context/LocaleContext'
import { StockCheckSettingsProvider } from './context/StockCheckSettingsContext'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <LocaleProvider>
          <AuthProvider>
            <StoresProvider>
              <App />
            </StoresProvider>
          </AuthProvider>
        </LocaleProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
