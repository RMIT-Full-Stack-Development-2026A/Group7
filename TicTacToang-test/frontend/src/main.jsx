import { StrictMode }    from 'react'
import { createRoot }    from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './shared/styles/global.css'
import RouterConfig from './router/RouterConfig'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <RouterConfig />
    </BrowserRouter>
  </StrictMode>
)