import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Coffee, 
  ShoppingCart, 
  Users, 
  Calendar, 
  Settings,
  ArrowLeft,
  Package,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalEvents: 0
  });

  useEffect(() => {
    if (!user) {
      setShowLoginModal(true);
    } else if (!isAdmin()) {
      // Redirect non-admin users
      window.location.href = '/';
    } else {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('nanacafe-token');
      
      // Load basic stats
      const [ordersRes, productsRes, eventsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/orders/`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${BACKEND_URL}/api/products/`),
        fetch(`${BACKEND_URL}/api/events/`)
      ]);

      if (ordersRes.ok) {
        const orders = await ordersRes.json();
        const totalRevenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
        setStats(prev => ({ 
          ...prev, 
          totalOrders: orders.length,
          totalRevenue 
        }));
      }

      if (productsRes.ok) {
        const products = await productsRes.json();
        setStats(prev => ({ ...prev, totalProducts: products.length }));
      }

      if (eventsRes.ok) {
        const events = await eventsRes.json();
        setStats(prev => ({ ...prev, totalEvents: events.length }));
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  if (!user || !isAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 rounded-full">
                <Coffee className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle>Admin Access Required</CardTitle>
            <CardDescription>
              Please login with admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => setShowLoginModal(true)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500"
            >
              Admin Login
            </Button>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>

        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => {
            setShowLoginModal(false);
            window.location.href = '/';
          }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/'}
                className="hover:bg-gray-100"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                  <Coffee className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Nana Cafe Admin</h1>
                  <p className="text-xs text-gray-600">Dashboard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user.full_name || user.username}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Active orders in system
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₱{stats.totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                From all orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                Active menu items
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                Upcoming events
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
                <CardDescription>
                  View and manage customer orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Order Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Advanced order management features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Management</CardTitle>
                <CardDescription>
                  Add, edit, and manage menu items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Product Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Full product CRUD operations will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage customer accounts and staff
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    User Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    User management features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Management</CardTitle>
                <CardDescription>
                  Create and manage pop-up events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Event Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Event creation and management tools will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cafe Settings</CardTitle>
                <CardDescription>
                  Configure delivery fees, business hours, and other settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Settings Management Coming Soon
                  </h3>
                  <p className="text-gray-600">
                    Comprehensive settings management will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
