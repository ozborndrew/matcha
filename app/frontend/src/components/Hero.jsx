import React from 'react';
import { Button } from './ui/button';
import { ArrowDown, Coffee, MapPin, Clock } from 'lucide-react';

const Hero = () => {
  const scrollToMenu = () => {
    const menuElement = document.getElementById('menu');
    if (menuElement) {
      menuElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="hero" className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 min-h-screen flex items-center overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-64 h-64 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-64 h-64 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-lg mb-6 hover:shadow-xl transition-shadow duration-300">
              <Coffee className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">Pop-up Coffee Experience</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Welcome to
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent block">
                Nana Cafe
              </span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Experience our unique pop-up coffee events featuring the finest brews and artisanal pastries in a cozy, temporary setting.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button 
                size="lg" 
                onClick={scrollToMenu}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl text-lg px-8 py-4"
              >
                View Our Menu
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById('events').scrollIntoView({ behavior: 'smooth' })}
                className="hover:bg-amber-50 hover:border-amber-300 transition-all duration-300 text-lg px-8 py-4"
              >
                Upcoming Events
              </Button>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <MapPin className="h-6 w-6 text-amber-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Multiple Locations</div>
                <div className="text-xs text-gray-600">Pop-up events citywide</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Clock className="h-6 w-6 text-amber-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Fresh Daily</div>
                <div className="text-xs text-gray-600">Made fresh every morning</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <Coffee className="h-6 w-6 text-amber-600 mb-2" />
                <div className="text-sm font-medium text-gray-900">Premium Coffee</div>
                <div className="text-xs text-gray-600">Artisan roasted beans</div>
              </div>
            </div>
          </div>

          {/* Right Visual - Coffee Animation */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Main coffee cup illustration */}
              <div className="w-80 h-80 bg-gradient-to-b from-amber-100 to-amber-200 rounded-full flex items-center justify-center shadow-2xl">
                <div className="w-64 h-64 bg-gradient-to-b from-amber-600 to-orange-700 rounded-full relative overflow-hidden shadow-inner">
                  {/* Coffee surface */}
                  <div className="absolute top-4 left-4 right-4 h-12 bg-gradient-to-r from-amber-800 to-orange-900 rounded-full">
                    {/* Steam animation */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                      <div className="w-1 h-12 bg-gradient-to-t from-gray-400 to-transparent rounded-full opacity-60 animate-pulse"></div>
                    </div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 -ml-3">
                      <div className="w-1 h-16 bg-gradient-to-t from-gray-400 to-transparent rounded-full opacity-40 animate-pulse delay-300"></div>
                    </div>
                    <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 ml-3">
                      <div className="w-1 h-16 bg-gradient-to-t from-gray-400 to-transparent rounded-full opacity-40 animate-pulse delay-700"></div>
                    </div>
                  </div>
                  
                  {/* Handle */}
                  <div className="absolute right-0 top-1/2 transform translate-x-4 -translate-y-1/2 w-8 h-16 border-4 border-amber-600 rounded-full"></div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-orange-200 rounded-full animate-bounce opacity-70"></div>
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-amber-200 rounded-full animate-bounce delay-500 opacity-70"></div>
              <div className="absolute top-1/2 -left-8 w-6 h-6 bg-yellow-200 rounded-full animate-bounce delay-1000 opacity-70"></div>
              
              {/* Sparkle effects */}
              <div className="absolute top-16 right-16 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
              <div className="absolute bottom-16 left-16 w-2 h-2 bg-amber-400 rounded-full animate-ping delay-700"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
