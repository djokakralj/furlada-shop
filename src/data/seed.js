import { addProduct } from './products.js';

const initialProducts = [
    {
      id: 1,
      name: 'Majica',
      description: 'Pamuk, udobna majica za svaki dan.',
      price: 19.99,
      imageUrl: '/majica.jpg'
    },
    {
      id: 2,
      name: 'Pantalone',
      description: 'Stilizovane pantalone, pogodne za večernje izlaze.',
      price: 39.99,
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Pantalone'
    },
    {
      id: 3,
      name: 'Jakna',
      description: 'Topla jakna za zimske mesece.',
      price: 59.99,
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Jakna'
    },
    {
      id: 4,
      name: 'Čarape',
      description: 'Pametne čarape, idealne za sport.',
      price: 9.99,
      imageUrl: 'https://via.placeholder.com/200x200.png?text=Carape'
    }
];

async function seedDatabase() {
    for (const product of initialProducts) {
      try {
        await addProduct(product);
        console.log(`Added product: ${product.name}`);
      } catch (error) {
        console.error(`Error adding product ${product.name}:`, error);
      }
    }
  }
  
  seedDatabase();