import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from '../hooks/use-toast';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.product_id === action.payload.id);
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product_id === action.payload.id
            ? { 
                ...item, 
                quantity: item.quantity + 1,
                total_price: (item.quantity + 1) * item.unit_price
              }
            : item
        );
        return { ...state, items: updatedItems };
      } else {
        const newItem = {
          product_id: action.payload.id,
          product_name: action.payload.name,
          quantity: 1,
          unit_price: action.payload.price,
          total_price: action.payload.price,
          image_url: action.payload.image_url
        };
        return { ...state, items: [...state.items, newItem] };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      const updatedItems = state.items.map(item =>
        item.product_id === action.payload.productId
          ? { 
              ...item, 
              quantity: action.payload.quantity,
              total_price: action.payload.quantity * item.unit_price
            }
          : item
      );
      return { ...state, items: updatedItems };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'LOAD_CART':
      return { ...state, items: action.payload || [] };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('nanacafe-cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartData });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nanacafe-cart', JSON.stringify(state.items));
  }, [state.items]);

  const addToCart = (product) => {
    dispatch({ type: 'ADD_TO_CART', payload: product });
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const removeFromCart = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    if (item) {
      toast({
        title: "Removed from cart",
        description: `${item.product_name} has been removed from your cart.`,
      });
    }
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };

  const getTotalItems = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return state.items.reduce((total, item) => total + item.total_price, 0);
  };

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems: state.items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
