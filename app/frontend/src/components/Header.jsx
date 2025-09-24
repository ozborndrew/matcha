import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Menu, X, ShoppingCart, User, Coffee } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onLoginClick, onCartClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, getTotalItems } = useCart();
  const { user, logout } = useAuth();

  const totalItems = getTotalItems();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg shadow-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Nana Cafe</span>
              <p className="text-xs text-gray-600">Coffee & Pastries</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => scrollToSection('menu')}
              className="text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium"
            >
              Menu
            </button>
            <button 
              onClick={() => scrollToSection('delivery')}
              className="text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium"
            >
              Order Now
            </button>
            <button 
              onClick={() => scrollToSection('events')}
              className="text-gray-700 hover:text-amber-600 transition-colors duration-200 font-medium"
            >
              Events
            </button>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button */}
            <Button
              variant="outline"
              onClick={onCartClick}
              className="relative hover:bg-amber-50 hover:border-amber-300 transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 hover:bg-amber-600 min-w-[20px] h-5 flex items-center justify-center text-xs">
                  {totalItems}
                </Badge>
              )}
            </Button>

            {/* User Actions */}
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Hello, {user.full_name || user.username}</span>
                <Button 
                  variant="ghost" 
                  onClick={logout}
                  className="hover:bg-gray-100"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <Button 
                onClick={onLoginClick}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <User className="h-4 w-4 mr-1" />
                Login
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-gray-100 transition-colors duration-200"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              <button 
                onClick={() => scrollToSection('menu')}
                className="text-gray-700 hover:text-amber-600 transition-colors duration-200 py-2 text-left"
              >
                Menu
              </button>
              <button 
                onClick={() => scrollToSection('delivery')}
                className="text-gray-700 hover:text-amber-600 transition-colors duration-200 py-2 text-left"
              >
                Order Now
              </button>
              <button 
                onClick={() => scrollToSection('events')}
                className="text-gray-700 hover:text-amber-600 transition-colors duration-200 py-2 text-left"
              >
                Events
              </button>
              
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={onCartClick}
                  className="w-full relative"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Cart
                  {totalItems > 0 && (
                    <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
                
                {user ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Hello, {user.full_name || user.username}</p>
                    <Button 
                      variant="outline" 
                      onClick={logout}
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={onLoginClick}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
                  >
                    Login
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
