import { createRoot } from 'react-dom/client'
import App from './App.jsx'

window.global = window;


createRoot(document.getElementById('root')).render(
    <App />
)
