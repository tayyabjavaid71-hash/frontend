import { AppRoutes } from './routes/AppRoutes';
import { CartDrawer } from './components/cart/CartDrawer';
// Footer is internally mapped inside the page blocks, so leaving it out of App root unless needed globally
import { MobileNav } from './components/layout/MobileNav';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans md:pb-0 pb-20">
      <AppRoutes />
      <CartDrawer />
      <MobileNav />
    </div>
  );
}

export default App;
