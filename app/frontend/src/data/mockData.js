// Mock data for Nana Cafe - to be replaced with API calls

export const mockProducts = [
  {
    id: "1",
    name: "Espresso",
    description: "Strong and bold coffee shot",
    price: 3.50,
    category: "coffee",
    image_url: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 100
  },
  {
    id: "2", 
    name: "Cappuccino",
    description: "Espresso with steamed milk foam",
    price: 4.50,
    category: "coffee",
    image_url: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 100
  },
  {
    id: "3",
    name: "Croissant", 
    description: "Buttery, flaky pastry",
    price: 3.00,
    category: "pastry",
    image_url: "https://images.unsplash.com/photo-1555507036-ab794f4aaec3?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 50
  },
  {
    id: "4",
    name: "Latte Art Special",
    description: "Beautifully crafted latte with artistic foam", 
    price: 5.00,
    category: "coffee",
    image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 100
  },
  {
    id: "5",
    name: "Chocolate Muffin",
    description: "Rich chocolate muffin with chocolate chips",
    price: 3.50,
    category: "pastry", 
    image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 30
  },
  {
    id: "6",
    name: "Iced Coffee",
    description: "Refreshing cold brew coffee with ice",
    price: 4.00,
    category: "coffee",
    image_url: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop",
    is_available: true,
    stock_quantity: 100
  }
];

export const mockEvents = [
  {
    id: "1",
    title: "Downtown Pop-Up",
    description: "Join us at our downtown location for a special weekend coffee experience",
    event_date: "2024-01-14",
    start_time: "9:00 AM",
    end_time: "5:00 PM",
    location: "Downtown Plaza, Main Street",
    is_featured: true,
    status: "upcoming"
  },
  {
    id: "2",
    title: "Art District Event", 
    description: "Coffee and art combine at our art district pop-up featuring local artists",
    event_date: "2024-01-21",
    start_time: "10:00 AM",
    end_time: "6:00 PM",
    location: "Art District Gallery, Creative Avenue", 
    is_featured: true,
    status: "upcoming"
  },
  {
    id: "3",
    title: "Holiday Special",
    description: "Festive drinks and treats at our holiday-themed pop-up event",
    event_date: "2024-01-28",
    start_time: "8:00 AM",
    end_time: "7:00 PM",
    location: "Community Center, Festival Park",
    is_featured: false,
    status: "upcoming"
  }
];

export const mockTimeSlots = [
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM", 
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
  "4:00 PM - 5:00 PM",
  "5:00 PM - 6:00 PM"
];

export const deliverySettings = {
  delivery_fee: 50.0,
  free_delivery_threshold: 200.0,
  min_order_amount: 100.0
};
