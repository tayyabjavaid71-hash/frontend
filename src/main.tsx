import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { initMetaPixel } from './utils/metaPixel';
import { initTikTokPixel } from './utils/tiktokPixel';

// Initialise Meta Pixel as early as possible (fires first PageView)
initMetaPixel();
// Initialise TikTok Pixel (fires first page() call automatically)
initTikTokPixel();

// React.StrictMode intentionally removed — it causes Supabase to emit
// "Lock was not released within 5000ms" warnings in development because
// StrictMode mounts components twice, creating duplicate auth-token lock
// contention. See: https://github.com/supabase/gotrue-js/issues/806
ReactDOM.createRoot(document.getElementById('root')!).render(
  <CurrencyProvider>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </CurrencyProvider>
);
