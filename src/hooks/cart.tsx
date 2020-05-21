import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';


interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const savedProducts = await AsyncStorage.getItem('@GoMarketplace:products');
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback( async product => {
    const productAddedIndex = products.findIndex(({ id }) => product.id === id);
    console.log(productAddedIndex);
    if (productAddedIndex === -1) {
      setProducts([ ...products, {...product, quantity: 1 } ]);
      await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(products));
    } else {
      increment(product.id);
    }


  }, [products]);

  const increment = useCallback(async id => {
    const productIndex = products.findIndex(product => product.id === id);
    const product = products[productIndex];
    const productsCopy = [...products];

    productsCopy[productIndex] = {
      ...product,
      quantity: product.quantity + 1
    };
    setProducts(productsCopy);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(productsCopy));
  }, [products]);

  const decrement = useCallback(async id => {
    const newProductList = products
      .map<Product>(product => {
        if (product.id === id) {
          return  {
            ...product,
            quantity: product.quantity - 1,
          }
        }

        return product;
      })
      .filter(
        ({ quantity }) => quantity > 0
      )

    setProducts(newProductList);
    await AsyncStorage.setItem('@GoMarketplace:products', JSON.stringify(newProductList));

  }, [products]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
