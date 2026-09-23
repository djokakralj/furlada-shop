import React, { useEffect } from 'react';
import { Route, Switch, useLocation, Link } from 'wouter';
import Header from './components/Header';
import CartPage from './pages/CartPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import Footer from './components/Footer';
import SearchResults from './pages/SearchResults';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminAttributes from './pages/admin/AdminAttributes';
import CheckoutPage from './pages/CheckoutPage';
import OrderPage from './pages/OrderPage';
import WishlistPage from './pages/WishlistPage';
import InfoPage from './pages/InfoPage';
import { ToastProvider } from './components/Toast';
import './App.css';

// wouter ne skroluje na vrh pri promeni rute — bez ovoga se nova stranica
// otvara na sredini ako je prethodna bila skrolovana
function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

function NotFound() {
  return (
    <div className="not-found">
      <span className="not-found-code">404</span>
      <h1>Stranica nije pronađena</h1>
      <p>Stranica koju tražite ne postoji ili je premeštena.</p>
      <Link href="/" className="not-found-btn">Nazad na početnu</Link>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
    <CartProvider>
      <WishlistProvider>
      <AuthProvider>
        <ScrollToTop />
        <Header />

        <div className="main-content">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/cart" component={CartPage} />
            <Route path="/product/:id" component={ProductPage} />
            <Route path="/search">
              {() => <SearchResults key={window.location.search} />}
            </Route>
            <Route path="/login" component={LoginPage} />
            <Route path="/profile" component={ProfilePage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/admin">
              {() => <AdminLayout><AdminDashboard /></AdminLayout>}
            </Route>
            <Route path="/admin/proizvodi">
              {() => <AdminLayout><AdminProducts /></AdminLayout>}
            </Route>
            <Route path="/admin/porudzbine">
              {() => <AdminLayout><AdminOrders /></AdminLayout>}
            </Route>
            <Route path="/admin/atributi">
              {() => <AdminLayout><AdminAttributes /></AdminLayout>}
            </Route>
            <Route path="/checkout" component={CheckoutPage} />
            <Route path="/order/:id" component={OrderPage} />
            <Route path="/wishlist" component={WishlistPage} />
            <Route path="/dostava">{() => <InfoPage slug="dostava" />}</Route>
            <Route path="/velicine">{() => <InfoPage slug="velicine" />}</Route>
            <Route path="/faq">{() => <InfoPage slug="faq" />}</Route>
            <Route path="/uslovi">{() => <InfoPage slug="uslovi" />}</Route>
            <Route path="/privatnost">{() => <InfoPage slug="privatnost" />}</Route>
            <Route component={NotFound} />
          </Switch>
        </div>

        <Footer />
      </AuthProvider>
      </WishlistProvider>
    </CartProvider>
    </ToastProvider>
  );
}

export default App;