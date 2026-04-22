import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import NotificationManager from '../components/NotificationManager';

const AdminPanel = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'product', 'category'
  const [editingItem, setEditingItem] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [homepageAction, setHomepageAction] = useState('show'); // 'show' or 'hide'
  const navigate = useNavigate();

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    discount: '',
    brand: '',
    show_on_homepage: true,
    main_image: null,
    second_image: null,
    third_image: null,
    fourth_image: null,
    main_image_url: '',
    second_image_url: '',
    third_image_url: '',
    fourth_image_url: ''
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: ''
  });

  // Order Details Modal States
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'notifications') {
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [activeTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products/admin/products/');
      console.log('📦 Admin Products API Response (full):', response.data);
      
      // Ensure each product has normalized image data
      const normalizedProducts = response.data.map((product, idx) => {
        const normalized = {
          ...product,
          stock: product.stock_quantity || product.stock || 0,
          discount: product.discount_amount || 0,
          image: product.image || product.main_image_url || product.main_image,
        };
        
        // تسجيل بيانات الصور للمنتجات الثلاثة الأولى فقط
        if (idx < 3) {
          console.log(`📸 Product ${idx + 1}: ${product.name}`, {
            image: product.image,
            main_image: product.main_image,
            main_image_url: product.main_image_url,
            image_2: product.image_2,
            image_3: product.image_3,
            image_4: product.image_4,
            normalized_image: normalized.image
          });
        }
        
        return normalized;
      });
      
      console.log(`✅ Normalized ${normalizedProducts.length} products`);
      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('خطأ في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log('Fetching notifications...');
      const response = await api.get('/notifications/notifications/?all=true');
      console.log('Notifications response:', response.data);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      console.log('Fetching unread count...');
      const response = await api.get('/notifications/notifications/unread_count/?all=true');
      console.log('Unread count response:', response.data);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
      if (error.response) {
        console.error('Error response:', error.response);
        console.error('Error status:', error.response.status);
        console.error('Error data:', error.response.data);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/api/notifications/${id}/mark_as_read/`);
      // Update the notification in the state
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, is_read: true } : notification
      ));
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/api/notifications/mark_all_as_read/');
      // Update all notifications in the state
      setNotifications(notifications.map(notification => ({ ...notification, is_read: true })));
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for local file upload
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('price', productForm.price);
      formData.append('stock_quantity', productForm.stock);
      formData.append('category', productForm.category);
      formData.append('discount_amount', productForm.discount || 0);
      formData.append('brand', productForm.brand || '');
      formData.append('show_on_homepage', productForm.show_on_homepage);

      if (productForm.main_image instanceof File) {
        formData.append('main_image', productForm.main_image);
      }
      if (productForm.second_image instanceof File) {
        formData.append('image_2', productForm.second_image);
      }
      if (productForm.third_image instanceof File) {
        formData.append('image_3', productForm.third_image);
      }
      if (productForm.fourth_image instanceof File) {
        formData.append('image_4', productForm.fourth_image);
      }

      console.log('📤 ارسال البيانات للـ API (FormData)...');

      let response;
      if (editingItem) {
        response = await api.put(`/products/admin/products/${editingItem.id}/`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await api.post('/products/admin/products/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      console.log('✅ نجح! الـ API Response:', response.data);

      fetchProducts();
      setShowModal(false);
      setEditingItem(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        discount: '',
        brand: '',
        show_on_homepage: true,
        main_image: null,
        second_image: null,
        third_image: null,
        fourth_image: null,
        main_image_url: '',
        second_image_url: '',
        third_image_url: '',
        fourth_image_url: ''
      });
    } catch (error) {
      console.error('Error saving product:', error);
      alert('حدث خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingItem) {
        await api.put(`/products/categories/${editingItem.id}/`, categoryForm);
      } else {
        await api.post('/products/categories/', categoryForm);
      }

      fetchCategories();
      setShowModal(false);
      setEditingItem(null);
      setCategoryForm({
        name: '',
        description: ''
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('حدث خطأ في حفظ القسم');
    } finally {
      setLoading(false);
    }
  };

  // Handle product selection
  const toggleProductSelection = (productId) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Toggle all products selection
  const toggleAllProducts = () => {
    if (selectedProducts.size === products.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(products.map(p => p.id)));
    }
  };

  // Execute homepage action (show/hide) for selected products
  const handleExecuteHomepageAction = async () => {
    if (selectedProducts.size === 0) {
      alert('يرجى تحديد منتجات أولاً');
      return;
    }

    const action = homepageAction === 'show' ? 'إظهار' : 'إخفاء';
    if (!window.confirm(`هل تريد ${action} ${selectedProducts.size} منتج في الصفحة الرئيسية؟`)) {
      return;
    }

    try {
      setLoading(true);
      const updatePromises = Array.from(selectedProducts).map(productId => {
        const product = products.find(p => p.id === productId);
        return api.put(`/products/admin/products/${productId}/`, {
          ...product,
          show_on_homepage: homepageAction === 'show'
        });
      });

      await Promise.all(updatePromises);
      
      setSelectedProducts(new Set());
      fetchProducts();
      alert(`تم ${action} المنتجات بنجاح`);
    } catch (error) {
      console.error('Error executing homepage action:', error);
      alert('حدث خطأ في تنفيذ الإجراء');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;

    try {
      if (type === 'products') {
        await api.delete(`/products/admin/products/${id}/`);
        fetchProducts();
      } else if (type === 'categories') {
        await api.delete(`/products/categories/${id}/`);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('حدث خطأ في الحذف');
    }
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);

    if (type === 'product') {
      if (item) {
        setProductForm({
          name: item.name,
          description: item.description,
          price: item.price.toString(),
          stock: item.stock.toString(),
          category: item.category?.id || '',
          discount: item.discount?.toString() || '',
          brand: item.brand || '',
          show_on_homepage: item.show_on_homepage !== undefined ? item.show_on_homepage : true,
          main_image: null,
          second_image: null,
          third_image: null,
          fourth_image: null,
          main_image_url: item.main_image || item.main_image_url || '',
          second_image_url: item.image_2 || item.second_image_url || '',
          third_image_url: item.image_3 || item.third_image_url || '',
          fourth_image_url: item.image_4 || item.fourth_image_url || ''
        });
      } else {
        setProductForm({
          name: '',
          description: '',
          price: '',
          stock: '',
          category: '',
          discount: '',
          brand: '',
          show_on_homepage: true,
          main_image: null,
          second_image: null,
          third_image: null,
          fourth_image: null,
          main_image_url: '',
          second_image_url: '',
          third_image_url: '',
          fourth_image_url: ''
        });
      }
    } else if (type === 'category') {
      if (item) {
        setCategoryForm({
          name: item.name,
          description: item.description
        });
      } else {
        setCategoryForm({
          name: '',
          description: ''
        });
      }
    }

    setShowModal(true);
  };

  const showOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/" className="flex items-center space-x-2 space-x-reverse">
                <div className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center overflow-hidden border border-gray-100">
                  <img src="https://cdn.zencoder.ai/user_uploads/677c385b0d0690002cd496be/07c08882-8951-40be-9bc0-0969d2d2a45d.png" alt="اللوكو" className="w-full h-full object-contain" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  شركة الريادة المتحدة - لوحة الإدارة
                </h1>
              </Link>
            </div>

            <div className="flex items-center space-x-4 space-x-reverse">
              <span className="text-gray-700">مرحباً، {user?.phone}</span>
              <Link
                to="/"
                className="text-primary-600 hover:text-primary-700 transition-colors"
              >
                المتجر
              </Link>
              <button
                onClick={() => setActiveTab('notifications')}
                className="relative text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              <button
                onClick={logout}
                className="text-red-600 hover:text-red-700 transition-colors"
              >
                تسجيل خروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 space-x-reverse">
              {[
                { id: 'products', name: 'المنتجات', icon: '📦' },
                { id: 'categories', name: 'الأقسام', icon: '📂' },
                { id: 'orders', name: 'الطلبات', icon: '🛒' },
                { id: 'notifications', name: 'الإشعارات', icon: '🔔' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
              <button
                onClick={() => openModal('product')}
                className="btn-primary"
              >
                + إضافة منتج جديد
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <>
                {/* Action buttons for selected items */}
                {selectedProducts.size > 0 && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200 flex justify-between items-center">
                    <span className="text-blue-900 font-semibold">
                      تم تحديد {selectedProducts.size} منتج
                    </span>
                    <div className="space-x-2 space-x-reverse">
                      <select
                        value={homepageAction}
                        onChange={(e) => setHomepageAction(e.target.value)}
                        className="px-3 py-2 border border-blue-300 rounded-md text-sm"
                      >
                        <option value="show">إظهار في الصفحة الرئيسية</option>
                        <option value="hide">إخفاء من الصفحة الرئيسية</option>
                      </select>
                      <button
                        onClick={handleExecuteHomepageAction}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                      >
                        ✓ نفذ
                      </button>
                    </div>
                  </div>
                )}

                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-900 text-white">
                      <tr>
                        <th className="px-3 md:px-6 py-3 text-center text-xs md:text-sm font-medium uppercase tracking-wider w-12">
                          <input
                            type="checkbox"
                            checked={selectedProducts.size === products.length && products.length > 0}
                            onChange={toggleAllProducts}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </th>
                        <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                          الصورة
                        </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                        المنتج
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                        القسم
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                        السعر
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                        المخزون
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-medium uppercase tracking-wider">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <img
                            className="h-16 w-16 md:h-20 md:w-20 rounded-lg object-cover border border-gray-200"
                            src={product.image || product.main_image || product.main_image_url || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="2.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E'}
                            alt={product.name}
                            title={product.name}
                            onError={(e) => {
                              console.warn(`❌ Failed to load image for product: ${product.name}`, e.target.src);
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="10" dy="2.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                            }}
                            onLoad={() => {
                              console.log(`✅ Image loaded for product: ${product.name}`);
                            }}
                          />
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div>
                            <div className="text-sm md:text-base font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500 line-clamp-2">
                              {product.description?.substring(0, 60)}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900">
                          {product.category?.name || 'غير محدد'}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm text-gray-900 font-bold">
                          {product.price} د.ع
                          {product.discount > 0 && (
                            <span className="text-red-500 text-xs mr-1">
                              (-{product.discount}%)
                            </span>
                          )}
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${product.stock > 10
                              ? 'bg-green-100 text-green-800'
                              : product.stock > 0
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                            {product.stock} قطعة
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium space-x-2 space-x-reverse">
                          <button
                            onClick={() => openModal('product', product)}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            تعديل
                          </button>
                          <button
                            onClick={() => handleDelete('products', product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">إدارة الأقسام</h2>
              <button
                onClick={() => openModal('category')}
                className="btn-primary"
              >
                + إضافة قسم جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {category.products_count || 0} منتج
                    </span>
                    <div className="space-x-2 space-x-reverse">
                      <button
                        onClick={() => openModal('category', category)}
                        className="text-primary-600 hover:text-primary-900 text-sm"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete('categories', category.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        حذف
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">إدارة الطلبات</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-900 text-white">
                    <tr>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        رقم الطلب
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        العميل
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        المبلغ الإجمالي
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        الحالة
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        التاريخ
                      </th>
                      <th className="px-3 md:px-6 py-3 text-right text-xs md:text-sm font-bold uppercase tracking-wider">
                        التفاصيل
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm font-medium text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-900 font-medium">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{order.customer_name || order.user?.full_name || 'غير محدد'}</span>
                              <button
                                onClick={() => {
                                  const name = order.customer_name || order.user?.full_name;
                                  if (name) {
                                    navigator.clipboard.writeText(name);
                                    alert('تم نسخ الاسم!');
                                  }
                                }}
                                className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                                title="نسخ الاسم"
                              >
                                📋
                              </button>
                            </div>
                            <div className="flex items-center gap-2 text-gray-500 text-xs">
                              <span>{order.customer_phone || order.user?.phone || 'غير محدد'}</span>
                              <button
                                onClick={() => {
                                  const phone = order.customer_phone || order.user?.phone;
                                  if (phone) {
                                    navigator.clipboard.writeText(phone);
                                    alert('تم نسخ الرقم!');
                                  }
                                }}
                                className="bg-gray-100 p-1 rounded hover:bg-gray-200"
                                title="نسخ الرقم"
                              >
                                📱
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-900 font-bold">
                          {order.total_amount} د.ع
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 md:px-3 py-1 text-xs md:text-sm font-bold rounded-lg border-2 ${order.status === 'completed'
                              ? 'bg-green-200 text-green-900 border-green-900'
                              : order.status === 'pending'
                                ? 'bg-yellow-200 text-yellow-900 border-yellow-900'
                                : 'bg-red-200 text-red-900 border-red-900'
                            }`}>
                            {order.status === 'completed' ? 'مكتمل' :
                              order.status === 'pending' ? 'قيد المعالجة' : 'ملغي'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm text-gray-700 font-medium">
                          {new Date(order.created_at).toLocaleDateString('ar-SA')}
                        </td>
                        <td className="px-3 md:px-6 py-3 whitespace-nowrap text-xs md:text-sm">
                          <button 
                            onClick={() => showOrderDetails(order)}
                            className="text-primary-600 hover:text-primary-800 font-bold underline"
                          >
                            عرض
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalType === 'product'
                  ? (editingItem ? 'تعديل المنتج' : 'إضافة منتج جديد')
                  : (editingItem ? 'تعديل القسم' : 'إضافة قسم جديد')
                }
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {modalType === 'product' ? (
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    required
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر (د.ع)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المخزون
                    </label>
                    <input
                      type="number"
                      required
                      value={productForm.stock}
                      onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      القسم
                    </label>
                    <select
                      required
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">اختر القسم</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الخصم (د.ع)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={productForm.discount}
                      onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العلامة التجارية (اختياري)
                    </label>
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="مثال: Samsung, Apple, إلخ"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      إظهار في الواجهة الرئيسية
                    </label>
                    <select
                      value={productForm.show_on_homepage ? 'true' : 'false'}
                      onChange={(e) => setProductForm({ ...productForm, show_on_homepage: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="true">نعم - إظهار في الواجهة الرئيسية</option>
                      <option value="false">لا - إخفاء من الواجهة الرئيسية</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الرئيسية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, main_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.main_image_url && (
                    <img
                      src={productForm.main_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الثانية
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, second_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.second_image_url && (
                    <img
                      src={productForm.second_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الثالثة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, third_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.third_image_url && (
                    <img
                      src={productForm.third_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الصورة الرابعة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProductForm({ ...productForm, fourth_image: e.target.files[0] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                  {productForm.fourth_image_url && (
                    <img
                      src={productForm.fourth_image_url}
                      alt="Preview"
                      className="mt-2 h-20 w-20 object-cover rounded"
                    />
                  )}
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleCategorySubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم القسم
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    rows="3"
                  />
                </div>

                <div className="flex justify-end space-x-4 space-x-reverse pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? 'جاري الحفظ...' : 'حفظ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">إدارة الإشعارات</h2>
            <div className="flex items-center space-x-4 space-x-reverse">
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {unreadCount} غير مقروء
                </span>
              )}
              <button
                onClick={markAllAsRead}
                className="btn-secondary"
                disabled={unreadCount === 0}
              >
                تعريف الكل كمقروء
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-5xl mb-4">🔔</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد إشعارات</h3>
                  <p className="text-gray-500">ستظهر هنا جميع الإشعارات عند توفرها</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-1">
                          <span className="text-2xl">
                            {notification.type === 'new_order' ? '🛒' : 
                             notification.type === 'order_status_changed' ? '📦' :
                             notification.type === 'low_stock' ? '⚠️' : '🔔'}
                          </span>
                        </div>
                        <div className="mr-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">{notification.title}</h3>
                            <div className="flex items-center space-x-2 space-x-reverse">
                              <span className="text-xs text-gray-500">
                                {new Date(notification.created_at).toLocaleDateString('ar-SA')} {new Date(notification.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {!notification.is_read && (
                                <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                              )}
                            </div>
                          </div>
                          <p className="mt-1 text-gray-600">{notification.message}</p>
                          {notification.type === 'new_order' && notification.data && (
                            <div className="mt-2 p-3 bg-gray-50 rounded-md">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-500">العميل: {notification.data.customer_name}</span>
                                <span className="text-gray-900 font-medium">المبلغ: {notification.data.total} د.ع</span>
                              </div>
                            </div>
                          )}
                          <div className="mt-3 flex justify-end">
                            {!notification.is_read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="text-sm text-primary-600 hover:text-primary-800"
                              >
                                تعريف كمقروء
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">تفاصيل الطلب #{selectedOrder.id}</h3>
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">اسم العميل</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_name}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.customer_name);
                      alert('تم نسخ الاسم!');
                    }}
                    className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition-colors"
                  >
                    نسخ الاسم
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">رقم الهاتف</p>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_phone}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedOrder.customer_phone);
                      alert('تم نسخ الرقم!');
                    }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 transition-colors"
                  >
                    نسخ الرقم
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600">المحافظة</p>
                <p className="font-semibold text-gray-900">{selectedOrder.governorate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">طريقة الدفع</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.payment_method === 'cash_on_delivery' ? 'الدفع عند الاستلام' : 'تحويل بنكي'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">الحالة</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.status === 'pending' ? 'قيد الانتظار' :
                   selectedOrder.status === 'confirmed' ? 'مؤكد' :
                   selectedOrder.status === 'preparing' ? 'قيد التحضير' :
                   selectedOrder.status === 'shipped' ? 'قيد الشحن' :
                   selectedOrder.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">التاريخ</p>
                <p className="font-semibold text-gray-900">{new Date(selectedOrder.created_at).toLocaleDateString('ar-SA')}</p>
              </div>
            </div>

            {/* Order Items with Images */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">المنتجات</h4>
              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      {/* Product Image */}
                      {item.product_image && (
                        <div className="flex-shrink-0">
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className="w-24 h-24 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96"%3E%3Crect fill="%23f3f4f6" width="96" height="96"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="12" dy="3.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3Eلا توجد صورة%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        </div>
                      )}
                      
                      {/* Product Info */}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-base">{item.product_name}</p>
                        <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                          <div>
                            <p className="text-gray-500">السعر</p>
                            <p className="font-semibold text-gray-900">{item.price} د.ع</p>
                          </div>
                          <div>
                            <p className="text-gray-500">الكمية</p>
                            <p className="font-semibold text-gray-900">{item.quantity}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">الإجمالي</p>
                            <p className="font-semibold text-gray-900">{item.total_price} د.ع</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد منتجات في هذا الطلب</p>
              )}
            </div>

            {/* Order Summary */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{selectedOrder.subtotal} د.ع</span>
              </div>
              {selectedOrder.coupon_discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>خصم الكوبون:</span>
                  <span className="font-semibold">-{selectedOrder.coupon_discount} د.ع</span>
                </div>
              )}
              <div className="flex justify-between text-gray-700">
                <span>رسوم التوصيل:</span>
                <span className="font-semibold">{selectedOrder.delivery_fee} د.ع</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-primary-600 bg-gray-50 p-2 rounded">
                <span>الإجمالي:</span>
                <span>{selectedOrder.total} د.ع</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowOrderDetailsModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Include NotificationManager component */}
      <NotificationManager isAdmin={true} />
    </div>
  );
};

export default AdminPanel;
