import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { CartDrawer } from './components/cart/CartDrawer';
import { trackPixelEvent } from './utils/metaPixel';

function MetaPageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPixelEvent('PageView', {
      page_path: `${location.pathname}${location.search}${location.hash}`,
    });
  }, [location.hash, location.pathname, location.search]);

  return null;
}

function App() {
  return (
    <>
      <MetaPageViewTracker />
      <AppRoutes />
      <CartDrawer />
    </>
  );
}

export default App;
