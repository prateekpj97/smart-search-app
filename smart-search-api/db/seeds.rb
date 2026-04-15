# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).

puts "Seeding sample products..."

# Clear existing products
Product.destroy_all

# Sample e-commerce products
products = [
  {
    title: "iPhone 13 Pro Max",
    description: "Latest Apple smartphone with A15 Bionic chip, 6.7-inch Super Retina XDR display, and triple-camera system.",
    category: "electronics",
    price: 1099.99,
    popularity_score: 95
  },
  {
    title: "Samsung Galaxy S23 Ultra",
    description: "Premium Android phone with S Pen, 200MP camera, and Snapdragon 8 Gen 2 processor.",
    category: "electronics",
    price: 1199.99,
    popularity_score: 88
  },
  {
    title: "MacBook Pro 16-inch",
    description: "Apple laptop with M3 Pro chip, 16GB RAM, 512GB SSD, and Liquid Retina XDR display.",
    category: "computers",
    price: 2499.99,
    popularity_score: 92
  },
  {
    title: "Dell XPS 15",
    description: "Windows laptop with Intel Core i7, 16GB RAM, 1TB SSD, and 4K OLED touchscreen.",
    category: "computers",
    price: 1899.99,
    popularity_score: 85
  },
  {
    title: "Sony WH-1000XM5",
    description: "Noise-cancelling wireless headphones with 30-hour battery life and premium sound quality.",
    category: "audio",
    price: 399.99,
    popularity_score: 90
  },
  {
    title: "Apple AirPods Pro",
    description: "Wireless earbuds with active noise cancellation, transparency mode, and spatial audio.",
    category: "audio",
    price: 249.99,
    popularity_score: 87
  },
  {
    title: "Nike Air Max 270",
    description: "Men's running shoes with Max Air cushioning and breathable mesh upper.",
    category: "footwear",
    price: 149.99,
    popularity_score: 82
  },
  {
    title: "Adidas Ultraboost 22",
    description: "Women's running shoes with Boost midsole and Primeknit upper for comfort.",
    category: "footwear",
    price: 179.99,
    popularity_score: 80
  },
  {
    title: "Levi's 501 Original Fit Jeans",
    description: "Classic men's jeans with straight leg and button fly in dark wash denim.",
    category: "clothing",
    price: 89.99,
    popularity_score: 75
  },
  {
    title: "North Face Jacket",
    description: "Waterproof men's jacket with fleece lining and adjustable hood for outdoor activities.",
    category: "clothing",
    price: 199.99,
    popularity_score: 78
  },
  {
    title: "KitchenAid Stand Mixer",
    description: "Professional 5-quart stand mixer with 10-speed settings and tilt-head design.",
    category: "home",
    price: 449.99,
    popularity_score: 85
  },
  {
    title: "Dyson V15 Detect Vacuum",
    description: "Cordless vacuum with laser detection, HEPA filtration, and 60-minute runtime.",
    category: "home",
    price: 749.99,
    popularity_score: 83
  },
  {
    title: "PlayStation 5",
    description: "Next-gen gaming console with 4K graphics, SSD storage, and DualSense controller.",
    category: "gaming",
    price: 499.99,
    popularity_score: 94
  },
  {
    title: "Xbox Series X",
    description: "Microsoft gaming console with 1TB SSD, 4K gaming, and Game Pass subscription.",
    category: "gaming",
    price: 499.99,
    popularity_score: 89
  },
  {
    title: "Apple Watch Series 9",
    description: "Smartwatch with blood oxygen sensor, ECG app, and always-on Retina display.",
    category: "wearables",
    price: 399.99,
    popularity_score: 86
  },
  {
    title: "Fitbit Charge 6",
    description: "Fitness tracker with heart rate monitoring, GPS, and 7-day battery life.",
    category: "wearables",
    price: 159.99,
    popularity_score: 79
  },
  {
    title: "Canon EOS R5",
    description: "Mirrorless camera with 45MP full-frame sensor and 8K video recording.",
    category: "cameras",
    price: 3899.99,
    popularity_score: 77
  },
  {
    title: "GoPro Hero 12",
    description: "Action camera with 5.3K video, HyperSmooth 6.0 stabilization, and waterproof design.",
    category: "cameras",
    price: 399.99,
    popularity_score: 84
  },
  {
    title: "Kindle Paperwhite",
    description: "E-reader with 6.8-inch glare-free display, adjustable warm light, and weeks of battery life.",
    category: "books",
    price: 149.99,
    popularity_score: 81
  },
  {
    title: "Bose SoundLink Revolve",
    description: "Portable Bluetooth speaker with 360-degree sound and water-resistant design.",
    category: "audio",
    price: 199.99,
    popularity_score: 76
  }
]

# Create products
products.each do |product_attrs|
  Product.create!(product_attrs)
  print "."
end

puts "\nSeeded #{Product.count} products successfully!"
