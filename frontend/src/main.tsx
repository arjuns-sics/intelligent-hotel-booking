import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import { Provider as JotaiProvider } from "jotai"
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"

import { queryClient } from "./lib/queryClient"
import { AuthProvider } from "./context/AuthProvider"
import App from "./App.tsx"

import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <App />
            <Toaster position="top-right" richColors />
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </JotaiProvider>
  </StrictMode>
)
