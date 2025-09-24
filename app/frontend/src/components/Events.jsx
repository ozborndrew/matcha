import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { mockEvents } from '../data/mockData';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/events/upcoming`);
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          throw new Error('Failed to fetch');
        }
      } catch (error) {
        console.log('Using mock data due to:', error.message);
        // Fallback to mock data
        setEvents(mockEvents);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return { day, month, year };
  };

  if (loading) {
    return (
      <section id="events" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Loading Events...
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
            Upcoming
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Events</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            As a pop-up cafe, our events are the best way to experience Nana Cafe. Check our schedule below for upcoming locations and dates.
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No upcoming events</h3>
            <p className="text-gray-600">Stay tuned for our next pop-up locations!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const { day, month, year } = formatDate(event.event_date);
              
              return (
                <Card key={event.id} className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 shadow-lg bg-white">
                  {/* Date Badge */}
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-white rounded-lg shadow-lg p-3 text-center min-w-[60px]">
                        <div className="text-2xl font-bold text-purple-600">{day}</div>
                        <div className="text-xs uppercase text-gray-600 font-medium">{month} {year}</div>
                      </div>
                    </div>
                    
                    {/* Event Image Placeholder */}
                    <div className="h-48 bg-gradient-to-br from-purple-200 to-pink-200 flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-purple-400 opacity-50" />
                    </div>
                    
                    {event.is_featured && (
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>

                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {event.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {/* Event Details */}
                    <div className="space-y-2">
                      {event.start_time && event.end_time && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                          <span>{event.start_time} - {event.end_time}</span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      
                      {event.max_capacity && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                          <span>
                            {event.current_registrations || 0}/{event.max_capacity} registered
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="pt-2">
                      <Badge 
                        variant={event.status === 'upcoming' ? 'default' : 'secondary'}
                        className={
                          event.status === 'upcoming' 
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                      >
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Want to Host an Event?
            </h3>
            <p className="text-gray-600 mb-6">
              Interested in hosting Nana Cafe at your location? We'd love to bring our pop-up experience to your community or event.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-gray-600">
                📧 Contact us: events@nanacafe.com
              </div>
              <div className="text-sm text-gray-600">
                📞 Call us: +63 912 345 6789
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Events;
