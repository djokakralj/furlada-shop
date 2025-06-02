import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Header from './components/Header';
import CartPage from './pages/CartPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import { CartProvider } from './context/CartContext';
import Footer from './Footer';
import SearchResults from './pages/SearchResults';
import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage'; // Dodaj import za AdminPage
import CheckoutPage from './pages/CheckoutPage'; // Dodaj import za CheckoutPage

function App() {
  const [loc] = useLocation();
  return (
    <AuthProvider>
      <CartProvider>  
        <Header />

        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/cart" component={CartPage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route path="/search">
            {() => <SearchResults key={loc} />}
          </Route>
          <Route path="/login" component={LoginPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/admin" component={AdminPage} />
          <Route path="/checkout" component={CheckoutPage} /> 
          <Route>404 - Stranica nije pronađena</Route>
        </Switch>

        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;