import React from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Coffee, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-2 rounded-lg">
                  <Coffee className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">Nana Cafe</span>
                  <p className="text-sm text-gray-400">Coffee & Pastries</p>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Experience our unique pop-up coffee events featuring the finest brews and artisanal pastries in cozy, temporary settings across the city.
              </p>
              
              {/* Social Links */}
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white">
                  <Twitter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    Menu
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('delivery')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    Order Online
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    Events
                  </button>
                </li>
                <li>
                  <a 
                    href="/admin" 
                    className="text-gray-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    Admin Dashboard
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-400">hello@nanacafe.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-400">+63 912 345 6789</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
                  <span className="text-gray-400">Pop-up locations across the city</span>
                </div>
              </div>

              {/* Operating Hours */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3 text-gray-300">Operating Hours</h4>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                  <div>Saturday - Sunday: 8:00 AM - 8:00 PM</div>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
              <p className="text-gray-400 mb-4 text-sm">
                Subscribe to get notified about new pop-up locations, special events, and exclusive offers.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
                  required
                />
                <Button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300"
                >
                  Subscribe
                </Button>
              </form>

              <div className="mt-4 text-xs text-gray-500">
                By subscribing, you agree to receive marketing emails from Nana Cafe. Unsubscribe at any time.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Nana Cafe. All rights reserved.
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-200">
                Cookie Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400 transition-colors duration-200">
                Support
              </a>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Made with ❤️ for coffee lovers everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
