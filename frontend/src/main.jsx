import { createRoot }    from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './shared/styles/global.css'
import './modules/startingpage/styles/index.css'
import RouterConfig from './router/RouterConfig'
import { applyThemeToDocument, loadGameSettings } from './shared/utils/gameSettings.js'

applyThemeToDocument(loadGameSettings())

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <RouterConfig />
  </BrowserRouter>
)
