import React, { useEffect, useState } from 'react';
import './ProductPage.css';
import { useRoute } from 'wouter'; // Ispravljen import za Wouter
import { getProducts } from '../data/products'; // Import funkcije za dobijanje proizvoda

const ProductPage = () => {
  const { id } = useRoute('/product/:id'); // Ispravno korišćenje Wouter-a za dobijanje parametra iz URL-a
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const products = await getProducts(); // Učitavanje svih proizvoda
        const foundProduct = products.find((p) => p.id === id); // Pronalazak proizvoda po ID-u
        setProduct(foundProduct);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    }

    fetchProduct();
  }, [id]);

  if (loading) {
    return <p>Loading product...</p>;
  }

  if (!product) {
    return <p>Proizvod nije pronađen!</p>;
  }

  return (
    <div className="product-page">
      <img src={product.imageUrl} alt={product.name} className="product-image" />
      <div className="product-info">
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <h3>{product.price} RSD</h3>
      </div>
    </div>
  );
};

export default ProductPage;
