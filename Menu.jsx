import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Plus, Search, Filter } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { mockProducts } from '../data/mockData';

const Menu = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const { addToCart, getItemQuantity } = useCart();
  
  const categories = [
    { value: 'all', label: 'All Items' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'pastry', label: 'Pastries' },
    { value: 'beverage', label: 'Beverages' },
    { value: 'snack', label: 'Snacks' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // For now, use mock data. Replace with API call later
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/products/`);
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        console.log('Using mock data due to:', error.message);
        // Fallback to mock data
        setProducts(mockProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = (product) => {
    if (!product.is_available) return;
    addToCart(product);
  };

  if (loading) {
    return (
      <section id="menu" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loading Our Menu...
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Our
            <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent"> Delicious Menu</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Freshly brewed coffee and artisanal pastries made with love every day
          </p>
        </div>

        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-amber-200 focus:border-amber-500 focus:ring-amber-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <Button
                  key={category.value}
                  variant={selectedCategory === category.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.value)}
                  className={
                    selectedCategory === category.value
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'hover:bg-amber-50 hover:border-amber-300'
                  }
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const quantity = getItemQuantity(product.id);
            return (
              <Card key={product.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white">
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                    }}
                  />
                  {!product.is_available && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive" className="text-white">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {quantity > 0 && (
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-amber-500 hover:bg-amber-600">
                        {quantity} in cart
                      </Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      {product.name}
                    </CardTitle>
                    <Badge 
                      variant="secondary" 
                      className="bg-amber-100 text-amber-800 border-amber-200"
                    >
                      {product.category}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                      ₱{product.price.toFixed(2)}
                    </div>
                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.is_available}
                      className={
                        product.is_available
                          ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300'
                          : 'opacity-50 cursor-not-allowed'
                      }
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      {quantity > 0 ? 'Add More' : 'Add to Cart'}
                    </Button>
                  </div>

                  {product.stock_quantity !== undefined && product.stock_quantity <= 5 && product.stock_quantity > 0 && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                        Only {product.stock_quantity} left!
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* No Results */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="mt-4"
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Menu;
