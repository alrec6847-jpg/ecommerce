import { useEffect, useState } from 'react';
import * as axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { api, endpoints } from '../api';
import BottomNav from '../components/BottomNav';
import Cart from '../components/CartNew';
import Checkout from '../components/CheckoutNew';
import TopBar from '../components/TopBar';
import BannerSlider from '../components/BannerSlider';
import CategorySlider from '../components/CategorySlider';
import CategoryProductsSection from '../components/CategoryProductsSection';
import { formatCurrency } from '../utils/currency';

const Home = ({ user, setUser }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [logo, setLogo] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLogo();
    loadCart();
    // Show welcome message if exists
    const welcomeMessage = localStorage.getItem('welcome_message');
    if (welcomeMessage) {
      showNotification(welcomeMessage);
      localStorage.removeItem('welcome_message');
    }
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([fetchProducts(), fetchCategories()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    
    if (!value.trim()) {
      setSearchResults(null);
      return;
    }

    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(value.toLowerCase()) ||
      product.category_name?.toLowerCase().includes(value.toLowerCase()) ||
      product.description?.toLowerCase().includes(value.toLowerCase())
    );

    setSearchResults(filtered);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('.relative')) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const fetchProducts = async () => {
    try {
      const response = await api.get(endpoints.products);
      console.log('📡 API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log(`📦 Products list (${list.length} منتجات):`, list);
      
      // Normalize to match UI expectations
      const normalized = list.map((p) => {
        const finalImage = p.image || p.main_image_url || p.main_image || null;
        // Log image details for first 3 products
        if (list.indexOf(p) < 3) {
          console.log(`🖼️ منتج: ${p.name}`, {
            'id': p.id,
            'p.image': p.image ? '✅' : '❌',
            'p.main_image_url': p.main_image_url ? '✅' : '❌',
            'p.main_image': p.main_image ? '✅' : '❌',
            'النهائي': finalImage ? '✅' : '❌',
            'URL': finalImage
          });
        }
        return {
          ...p,
          image: finalImage,
          stock: typeof p.stock_quantity === 'number' ? p.stock_quantity : (p.is_in_stock ? 1 : 0),
          discount: typeof p.discount_percentage === 'number' ? p.discount_percentage : 0,
        };
      });
      
      console.log('✅ منتجات معالجة:', normalized);
      setProducts(normalized);
    } catch (error) {
      console.error('❌ خطأ في جلب المنتجات:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get(endpoints.categories);
      console.log('Categories API Response:', response);
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.results || []);
      console.log('Categories list:', list);
      setCategories(list);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchLogo = async () => {
    try {
      console.log('Fetching logo from API...');
      const response = await api.get('/products/logo/');
      console.log('Logo API Full Response:', response);
      console.log('Logo data:', response.data);
      
      if (response.data && response.data.image_url) {
        console.log('Logo image_url found:', response.data.image_url);
        setLogo(response.data);
      } else {
        console.warn('No image_url in response:', response.data);
        setLogo(null);
      }
    } catch (error) {
      console.error('Error fetching logo:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setLogo(null);
    }
  };

  const loadCart = () => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const handleCartChange = (newCart) => {
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const addToCart = (product) => {
    // التحقق من المخزون
    if (product.stock <= 0) {
      showNotification('عذراً، هذا المنتج غير متوفر في المخزون', 'error');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    let newCart;

    if (existingItem) {
      // التحقق من أن الكمية الجديدة لا تتجاوز المخزون
      const newQuantity = existingItem.quantity + 1;
      if (newQuantity > product.stock) {
        showNotification(`عذراً، المخزون المتوفر فقط ${product.stock} قطعة`, 'error');
        return;
      }
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: newQuantity }
          : item
      );
    } else {
      // حساب السعر المخصوم الصحيح
      const priceNum = Number(product?.price ?? 0);
      const discountAmount = Number(product?.discount_amount ?? 0);
      const finalPrice = product?.discounted_price 
        ? Number(product.discounted_price) 
        : (discountAmount > 0 ? Math.max(priceNum - discountAmount, 0) : priceNum);
      
      // حفظ المنتج مع السعر المخصوم
      const productWithDiscountedPrice = {
        ...product,
        price: finalPrice,
        original_price: priceNum,
        quantity: 1
      };
      newCart = [...cart, productWithDiscountedPrice];
    }

    handleCartChange(newCart);

    // Show success message
    showNotification('تم إضافة المنتج للسلة بنجاح!', 'success');
  };

  const showNotification = (message, type = 'success') => {
    // Create notification element
    const notification = document.createElement('div');
    const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 bounce-in`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const toggleCart = () => {
    setIsCartOpen(!isCartOpen);
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutComplete = () => {
    setCart([]);
    setIsCheckoutOpen(false);
    window.location.reload();
  };

  const filteredProducts = products.filter(product => {
    console.log('Filtering product:', product, 'selectedCategory:', selectedCategory);
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // If no category is selected (homepage), only show products with show_on_homepage = true
    // If a category is selected, show all products in that category
    const matchesHomepage = selectedCategory ? true : (product.show_on_homepage !== false);
    
    return matchesCategory && matchesSearch && matchesHomepage;
  });

  // Helper function to get products for a specific category
  const getProductsForCategory = (categoryId) => {
    return products.filter(product => {
      const matchesCategory = product.category === categoryId;
      const isActive = product.is_active !== false;
      const matchesSearch = searchTerm === '' ||
        (product.name && product.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && isActive && matchesSearch;
    });
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Load coupon data from localStorage for Checkout
  const appliedCoupon = localStorage.getItem('appliedCoupon') ? JSON.parse(localStorage.getItem('appliedCoupon')) : null;
  const couponDiscount = localStorage.getItem('couponDiscount') ? parseFloat(localStorage.getItem('couponDiscount')) : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">{/* pb for bottom nav */}
      {isCartOpen && <Cart cart={cart} onCartChange={handleCartChange} onClose={toggleCart} handleCheckout={handleCheckout} />}
      {isCheckoutOpen && <Checkout cart={cart} onCheckout={handleCheckoutComplete} onClose={() => setIsCheckoutOpen(false)} appliedCoupon={appliedCoupon} couponDiscount={couponDiscount} />}
      {/* Top bar */}
      <TopBar />
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-2 md:space-x-3 space-x-reverse flex-shrink min-w-0">
              <div className="flex-shrink-0">
                <div className="w-11 h-11 md:w-13 md:h-13 rounded-lg shadow-md flex items-center justify-center overflow-hidden flex-shrink-0 bg-white">
                  {logo && logo.image_url ? (
                    <img 
                      src={logo.image_url} 
                      alt="شركة الريادة" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        console.error('Failed to load logo image, using fallback SVG');
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!logo?.image_url && (
                    <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                      <defs>
                        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor:'#F97316',stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'#EA580C',stopOpacity:1}} />
                        </linearGradient>
                        <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{stopColor:'#DC2626',stopOpacity:1}} />
                          <stop offset="100%" style={{stopColor:'#B91C1C',stopOpacity:1}} />
                        </linearGradient>
                      </defs>
                      <g id="leftHand">
                        <path d="M 45 115 Q 30 110 25 125 Q 28 135 45 130 Z" fill="url(#redGradient)" stroke="#991B1B" strokeWidth="1.5"/>
                        <path d="M 45 115 Q 35 140 55 155 Q 75 160 85 140 Q 75 125 65 120 Q 55 115 45 115 Z" fill="url(#redGradient)" stroke="#991B1B" strokeWidth="1.5"/>
                        <path d="M 50 115 Q 48 105 50 90" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                        <path d="M 62 118 Q 62 105 65 88" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                        <path d="M 75 125 Q 78 115 80 95" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                      </g>
                      <g id="rightHand">
                        <path d="M 155 115 Q 170 110 175 125 Q 172 135 155 130 Z" fill="url(#redGradient)" stroke="#991B1B" strokeWidth="1.5"/>
                        <path d="M 155 115 Q 165 140 145 155 Q 125 160 115 140 Q 125 125 135 120 Q 145 115 155 115 Z" fill="url(#redGradient)" stroke="#991B1B" strokeWidth="1.5"/>
                        <path d="M 150 115 Q 152 105 150 90" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                        <path d="M 138 118 Q 138 105 135 88" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                        <path d="M 125 125 Q 122 115 120 95" stroke="#DC2626" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                      </g>
                      <g id="house">
                        <path d="M 60 95 L 100 50 L 140 95 Z" fill="url(#orangeGradient)" stroke="#EA580C" strokeWidth="2" strokeLinejoin="round"/>
                        <rect x="125" y="60" width="12" height="35" fill="url(#orangeGradient)" stroke="#EA580C" strokeWidth="1.5"/>
                        <rect x="60" y="95" width="80" height="65" fill="url(#orangeGradient)" stroke="#EA580C" strokeWidth="2"/>
                        <rect x="82" y="120" width="36" height="40" fill="#DC2626" stroke="#991B1B" strokeWidth="2" rx="2"/>
                        <circle cx="113" cy="142" r="2.5" fill="#FCD34D" stroke="#F59E0B" strokeWidth="1"/>
                        <rect x="68" y="105" width="18" height="18" fill="#87CEEB" stroke="#60A5FA" strokeWidth="1.5" rx="2"/>
                        <line x1="77" y1="105" x2="77" y2="123" stroke="#60A5FA" strokeWidth="1"/>
                        <line x1="68" y1="114" x2="86" y2="114" stroke="#60A5FA" strokeWidth="1"/>
                        <rect x="114" y="105" width="18" height="18" fill="#87CEEB" stroke="#60A5FA" strokeWidth="1.5" rx="2"/>
                        <line x1="123" y1="105" x2="123" y2="123" stroke="#60A5FA" strokeWidth="1"/>
                        <line x1="114" y1="114" x2="132" y2="114" stroke="#60A5FA" strokeWidth="1"/>
                      </g>
                      <g id="rLetter">
                        <rect x="108" y="75" width="14" height="55" fill="url(#orangeGradient)" stroke="#EA580C" strokeWidth="2" rx="3"/>
                        <path d="M 122 75 Q 150 75 150 95 Q 150 108 122 108" fill="url(#orangeGradient)" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M 122 108 L 155 130" stroke="url(#orangeGradient)" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                    </svg>
                  )}
                </div>
              </div>
              <div className="min-w-0 flex-shrink">
                <h1 className="hidden sm:block text-lg md:text-xl lg:text-2xl font-bold text-primary-600 whitespace-nowrap truncate">شركة الريادة</h1>
                <h1 className="sm:hidden text-sm font-bold text-primary-600 whitespace-nowrap">الريادة</h1>
              </div>
            </div>

            {/* Search + Icons */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Search icon (mobile) */}
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="p-2.5 text-gray-600 hover:text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50 md:hidden hover:scale-110 active:scale-95"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </button>
              {/* Cart */}
              <div className="relative">
                <button onClick={toggleCart} className="p-2.5 text-gray-600 hover:text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50 relative hover:scale-110 active:scale-95">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="9" cy="21" r="1"/>
                    <circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                  {getCartItemCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-md">
                      {getCartItemCount()}
                    </span>
                  )}
                </button>
              </div>
              {/* Refresh */}
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="p-2.5 text-gray-600 hover:text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50 hover:scale-110 active:scale-95 disabled:opacity-60"
                title="تحديث البيانات"
              >
                <svg className={`h-5 w-5 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="23 4 23 10 17 10"/>
                  <polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36M20.49 15a9 9 0 0 1-14.85 3.36"/>
                </svg>
              </button>
              {/* Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)} 
                  className="p-2.5 text-gray-600 hover:text-primary-600 transition-all duration-300 rounded-lg hover:bg-primary-50 hover:scale-110 active:scale-95"
                >
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="21" y2="12"/>
                    <line x1="3" y1="18" x2="21" y2="18"/>
                  </svg>
                </button>
                
                {/* Categories Dropdown */}
                {isMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100 overflow-hidden transition-all duration-300 transform origin-top-left">
                    <div className="bg-gradient-to-r from-primary-500 to-secondary-600 px-4 py-2 text-white text-sm font-medium">
                      تصفح حسب الفئة
                    </div>
                    <button
                      onClick={() => {
                        setSelectedCategory('');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center justify-start"
                    >
                      <span className="ml-2">جميع المنتجات</span>
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                      </svg>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    {categories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setIsMenuOpen(false);
                        }}
                        className="block w-full text-right px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center justify-start"
                      >
                        <span className="ml-2">{category.name}</span>
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop search */}
              <div className="hidden md:block w-72">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="ابحث..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  {searchResults !== null && searchResults.length > 0 && (
                    <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                      {searchResults.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => {
                            setSearchTerm('');
                            setSearchResults(null);
                          }}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 animate-fadeIn"
                        >
                          {product.image && (
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="h-12 w-12 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.category_name}</p>
                          </div>
                          <p className="text-sm font-bold text-primary-600 whitespace-nowrap">{formatCurrency(product.price)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults !== null && searchResults.length === 0 && searchTerm.trim() && (
                    <div className="absolute top-full right-0 left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4 text-center text-gray-500 animate-fadeIn">
                      لا توجد نتائج لـ "{searchTerm}"
                    </div>
                  )}
                </div>
              </div>

              {/* User */}
              {user ? (
                <div className="flex flex-col md:flex-row md:items-center md:space-x-4 md:space-x-reverse">
                  <span className="text-gray-700 text-sm mb-2 md:mb-0">مرحباً، {user.phone}</span>
                  {user.is_admin && (
                    <Link to="/admin" className="btn-secondary py-2 px-3 text-sm mb-2 md:mb-0">لوحة الإدارة</Link>
                  )}
                  <button onClick={logout} className="text-red-600 hover:text-red-700 text-sm">تسجيل خروج</button>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row">
                  <Link to="/login" className="btn-primary py-2 px-4 text-sm">تسجيل دخول</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Search Modal */}
      {isSearchOpen && (
        <div className="md:hidden fixed inset-0 bg-black/40 z-50 flex flex-col">
          <div className="bg-white shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2 sticky top-0 bg-white">
              <input
                type="text"
                placeholder="ابحث عن منتج أو قسم..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
                className="flex-1 px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-2.5 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {searchResults !== null && searchResults.length > 0 && (
              <div className="max-w-7xl mx-auto px-4 py-2 border-t border-gray-200">
                <div className="space-y-2">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      to={`/products/${product.id}`}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500">{product.category_name}</p>
                      </div>
                      <p className="text-sm font-bold text-primary-600 whitespace-nowrap ml-2">{formatCurrency(product.price)}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {searchResults !== null && searchResults.length === 0 && searchTerm.trim() && (
              <div className="max-w-7xl mx-auto px-4 py-4 text-center text-gray-500 border-t border-gray-200">
                لا توجد نتائج لـ "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Banner Slider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <BannerSlider />
      </div>

      {/* Category Slider */}
      <CategorySlider categories={categories} selectedCategory={selectedCategory} onCategorySelect={setSelectedCategory} />

      {/* Products by Category Sections */}
      <div className="bg-gradient-to-b from-white to-gray-50">
        {selectedCategory ? (
          // If a specific category is selected, show grid view with filter
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800 inline-block relative">
                  {categories.find(c => c.id === selectedCategory)?.name || 'منتجاتنا'}
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary-500 to-secondary-600 rounded-full"></div>
                </h3>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-16 fade-in">
                  <div className="inline-block p-6 rounded-full bg-gray-100 mb-6">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-3">لا توجد منتجات</h3>
                  <p className="text-gray-600 max-w-md mx-auto mb-6">لم يتم العثور على منتجات في هذا القسم</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
              {filteredProducts.map((product, index) => (
                <div 
                  key={product.id} 
                  className="product-card bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 w-full aspect-square">
                    <img
                      src={product.image || '/placeholder-product.png'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      onLoad={(e) => {
                        if (index < 3) {
                          console.log(`✅ تم تحميل صورة: ${product.name}`);
                        }
                      }}
                      onError={(e) => {
                        console.log(`❌ فشل تحميل صورة: ${product.name}`);
                        console.log(`   URL كان: ${product.image || '/placeholder-product.png'}`);
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="24" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    {(product.discount_percentage || product.discount) > 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-red-600 text-white w-10 h-10 rounded-full text-xs font-bold shadow-lg flex items-center justify-center">
                        <span>{product.discount_percentage || product.discount}%</span>
                      </div>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center">
                        <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="mr-1">متبقي {product.stock}</span>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/50 flex items-center justify-center">
                        <div className="text-center p-4">
                          <span className="text-white font-bold text-xl block mb-2">نفد المخزون</span>
                          <span className="text-white/80 text-sm">غير متوفر حالياً</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-3 md:p-4 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-sm md:text-base text-gray-800 line-clamp-3 flex-1 pr-2">
                        {product.name}
                      </h4>
                      {product.brand && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {product.brand}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mb-3 line-clamp-1 pr-2 hidden md:block">
                      {product.description || 'لا يوجد وصف متاح للمنتج'}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                      {(product.discount_percentage || product.discount) > 0 || (product.discounted_price && product.discounted_price < product.price) ? (
                        <div className="flex items-center space-x-2 space-x-reverse flex-1">
                          <span className="text-base md:text-lg font-bold text-primary-600">
                            {formatCurrency(product.discounted_price || (product.price * (1 - (product.discount_percentage || product.discount) / 100)))}
                          </span>
                          <span className="text-xs md:text-sm text-gray-500 line-through">
                            {formatCurrency(product.price)}
                          </span>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <span className="text-base md:text-lg font-bold text-primary-600">
                            {formatCurrency(product.discounted_price || product.price)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-1 space-x-reverse">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className={`flex-1 py-2 px-2 rounded-lg font-medium transition-all text-xs ${product.stock === 0
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : 'btn-primary shadow-md hover:shadow-lg'
                          }`}
                      >
                        {product.stock === 0 ? (
                          <span className="flex items-center justify-center">
                            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            نفد المخزون
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                            </svg>
                            <span className="hidden sm:inline">أضف للسلة</span><span className="sm:hidden">سلة</span>
                          </span>
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product.id}`);
                        }}
                        className="px-2 py-2 border border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors flex items-center text-xs"
                      >
                        <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span className="hidden sm:inline">تفاصيل</span><span className="sm:hidden">عرض</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
                </div>
              )}
            </div>
          </section>
        ) : (
          // If no category selected, show carousel view of all categories with their products
          <>
            <section className="py-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h3 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">منتجاتنا</h3>
                  <p className="text-gray-600">اكتشف أحدث المنتجات الإلكترونية بأفضل الأسعار وجودة في العراق</p>
                </div>
              </div>
            </section>
            
            {/* Category Product Sliders */}
            {categories.map(category => {
              const categoryProducts = getProductsForCategory(category.id);
              return (
                <CategoryProductsSection
                  key={category.id}
                  category={category}
                  products={categoryProducts}
                  onAddToCart={addToCart}
                  onViewDetails={(product) => navigate(`/product/${product.id}`)}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">شركة الريادة المتحدة</h3>
              <p className="text-gray-300">
                متجرك الإلكتروني المفضل للحصول على أفضل المنتجات بأسعار مميزة
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">المنتجات</a></li>
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">اتصل بنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">خدمة العملاء</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">سياسة الإرجاع</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الشحن والتوصيل</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الدعم الفني</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <div className="space-y-2 text-gray-300">
                <a href="tel:07834950300" className="hover:text-white transition-colors block">📞 07834950300</a>
                <a href="https://wa.me/9647834950300" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">💬 واتساب</a>
                <a href="https://t.me/+9647834950300" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors block">📱 تيليجرام</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2025 شركة الريادة المتحدة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="grid grid-cols-4 gap-1">
          <button className="flex flex-col items-center py-2 text-primary-600">
            <svg className="h-6 w-6 mb-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
            </svg>
            <span className="text-xs">الرئيسية</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs">البحث</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600 relative">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
            </svg>
            {getCartItemCount() > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
            <span className="text-xs">السلة</span>
          </button>
          <button className="flex flex-col items-center py-2 text-gray-600">
            <svg className="h-6 w-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs">الحساب</span>
          </button>
        </div>
      </div>
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Home;
