import '@fontsource-variable/bricolage-grotesque'
import '@fontsource-variable/figtree'
import '@fontsource-variable/jetbrains-mono'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import { StoreProvider } from './context/store'
import AppRoutes from './routes/AppRoutes'
import { ThemeProvider } from './theme/ThemeProvider'

createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <StoreProvider>
      <AppRoutes />
    </StoreProvider>
  </ThemeProvider>,
)
