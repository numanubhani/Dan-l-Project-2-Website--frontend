import React, { useState } from 'react';

interface ShopItem {
  id: string;
  title: string;
  price: string;
  image: string;
  sellerName: string;
  sellerAvatar: string;
  distance: string;
  category: string;
  condition: 'new' | 'like-new' | 'used';
}

const MOCK_ITEMS: ShopItem[] = [
  {
    id: '1',
    title: 'iPhone 15 Pro Max 256GB',
    price: '$899',
    image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
    sellerName: 'Alex Chen',
    sellerAvatar: 'https://i.pravatar.cc/150?img=12',
    distance: '0.5 mi',
    category: 'Electronics',
    condition: 'like-new'
  },
  {
    id: '2',
    title: 'Nike Air Max 270',
    price: '$120',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    sellerName: 'Sarah Johnson',
    sellerAvatar: 'https://i.pravatar.cc/150?img=47',
    distance: '1.2 mi',
    category: 'Fashion',
    condition: 'new'
  },
  {
    id: '3',
    title: 'MacBook Pro 14" M3',
    price: '$1,599',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    sellerName: 'Mike Davis',
    sellerAvatar: 'https://i.pravatar.cc/150?img=33',
    distance: '0.8 mi',
    category: 'Electronics',
    condition: 'used'
  },
  {
    id: '4',
    title: 'Vintage Leather Jacket',
    price: '$250',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    sellerName: 'Emma Wilson',
    sellerAvatar: 'https://i.pravatar.cc/150?img=45',
    distance: '2.1 mi',
    category: 'Fashion',
    condition: 'used'
  },
  {
    id: '5',
    title: 'Sony WH-1000XM5 Headphones',
    price: '$329',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    sellerName: 'David Lee',
    sellerAvatar: 'https://i.pravatar.cc/150?img=13',
    distance: '1.5 mi',
    category: 'Electronics',
    condition: 'like-new'
  },
  {
    id: '6',
    title: 'Designer Handbag',
    price: '$450',
    image: 'https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=400',
    sellerName: 'Lisa Park',
    sellerAvatar: 'https://i.pravatar.cc/150?img=20',
    distance: '0.9 mi',
    category: 'Fashion',
    condition: 'like-new'
  },
];

const Shop: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Electronics', 'Fashion', 'Home', 'Sports', 'Books'];

  const filteredItems = MOCK_ITEMS.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'new': return 'bg-green-100 text-green-700';
      case 'like-new': return 'bg-blue-100 text-blue-700';
      case 'used': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-gray-900">Shop</h1>
              <p className="text-sm text-gray-500">Items from people nearby</p>
            </div>
            <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search items or sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Category Tabs */}
          <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="px-4 py-6 pb-24">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getConditionColor(item.condition)}`}>
                      {item.condition}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-2 py-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-white text-xs font-bold">{item.distance}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-lg font-black text-purple-600 mb-2">{item.price}</p>
                  <div className="flex items-center space-x-2">
                    <img
                      src={item.sellerAvatar}
                      alt={item.sellerName}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-xs text-gray-600 font-medium">{item.sellerName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;

