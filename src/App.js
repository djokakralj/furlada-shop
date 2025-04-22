import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import Header from './components/Header';
import CartPage from './pages/CartPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage'; // Dodato
import { CartProvider } from './context/CartContext';
import Footer from './Footer';
import SearchResults from './pages/SearchResults';



function App() {
  const [loc] = useLocation();
  return (
    <CartProvider>
      <Header />

      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/cart" component={CartPage} />
        <Route path="/product/:id" component={ProductPage} /> {/* Nova ruta */}
        <Route path="/search">
        {() => <SearchResults key={loc} />}
        </Route>
        <Route>404 - Stranica nije pronađena</Route>
      </Switch>

      <Footer />
    </CartProvider>
  );
}

export default App;
