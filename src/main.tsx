import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { initAppSettings } from './lib/appSettings';

initAppSettings();

createRoot(document.getElementById('root')!).render(<App />);
