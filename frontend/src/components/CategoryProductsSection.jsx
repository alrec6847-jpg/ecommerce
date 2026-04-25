import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const CategoryProductsSection = ({ 
  category, 
  products, 
  onAddToCart,
  onViewDetails 
}) => {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-6 bg-white border-b border-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 border-r-4 border-indigo-600 pr-3">
            {category.name}
          </h3>
          <Link
            to={`/categories/${category.id}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium text-sm flex items-center gap-1"
          >
            عرض الكل
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Products Container */}
        <div className="relative">
          {/* Horizontal Scroll on Mobile, Grid on Desktop */}
          <div 
            className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-6 -mx-4 px-4 md:mx-0 md:px-0"
            style={{ 
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch'
            }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[190px] sm:w-[220px] md:w-auto snap-center md:snap-align-none bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-500 border border-gray-100 flex flex-col h-full group animate-fadeIn"
              >
                {/* Product Image */}
                <div 
                  className="relative aspect-[4/5] bg-gray-50 overflow-hidden cursor-pointer"
                  onClick={() => onViewDetails(product)}
                >
                  <img
                    src={product.image || product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  {/* Badges */}
                  {product.is_on_sale && (
                    <div className="absolute top-2 left-2 z-10">
                      <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                        -{product.discount_percentage}%
                      </div>
                    </div>
                  )}
                  
                  {product.is_featured && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className="bg-amber-400 text-white p-1 rounded-full shadow-sm">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-3 flex flex-col flex-1">
                  <h4 
                    className="font-bold text-xs sm:text-sm text-gray-800 mb-1 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors"
                    onClick={() => onViewDetails(product)}
                  >
                    {product.name}
                  </h4>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-indigo-600 font-bold text-sm sm:text-base">
                      {formatCurrency(product.discounted_price || product.price)}
                    </span>
                    {product.discount_percentage > 0 && (
                      <span className="text-gray-400 text-[10px] line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 sm:gap-2 mt-auto">
                    <button
                      onClick={() => onViewDetails(product)}
                      className="flex-1 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1"
                    >
                      عرض
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-[1.5] py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1 ${
                        product.stock > 0
                          ? 'bg-indigo-600 text-white shadow-sm hover:shadow-md hover:bg-indigo-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
                      </svg>
                      {product.stock > 0 ? 'سلة' : 'منتهي'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </section>
  );
};

export default CategoryProductsSection;