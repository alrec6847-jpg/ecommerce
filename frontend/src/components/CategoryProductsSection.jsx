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
    <section className="py-8 bg-white border-b border-gray-100 overflow-hidden" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-8 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></div>
            <h3 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
              {category.name}
            </h3>
          </div>
          <Link
            to={`/categories/${category.id}`}
            className="group flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all duration-300 font-bold text-sm"
          >
            عرض الكل
            <svg className="h-4 w-4 group-hover:translate-x-[-2px] transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>

        {/* Products Container */}
        <div className="relative">
          {/* Horizontal Slider - showing 2 items side by side on mobile */}
          <div 
            className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-6 -mx-4 px-4 md:mx-0 md:px-0 scroll-smooth"
            style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}
          >
            {products.map((product, index) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-[calc(50%-8px)] sm:w-[calc(40%-8px)] md:w-auto snap-start md:snap-align-none bg-white rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 border border-gray-100 flex flex-col h-full group animate-cardIn"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  touchAction: 'pan-x pan-y'
                }}
              >
                {/* Product Image */}
                <div 
                  className="relative aspect-[1/1] bg-[#F8F9FA] overflow-hidden cursor-pointer group"
                  onClick={() => onViewDetails(product)}
                >
                  <img
                    src={product.image || product.main_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Badges */}
                  {(product.discount_percentage > 0 || product.is_on_sale) && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg transform -rotate-2">
                        {product.discount_percentage > 0 ? `-${product.discount_percentage}%` : 'SALE'}
                      </div>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4 flex flex-col flex-1 bg-white">
                  <h4 
                    className="font-bold text-sm sm:text-base text-gray-800 mb-2 line-clamp-1 cursor-pointer hover:text-indigo-600 transition-colors leading-tight"
                    onClick={() => onViewDetails(product)}
                  >
                    {product.name}
                  </h4>
                  
                  <div className="flex flex-col mb-4">
                    <span className="text-indigo-600 font-black text-base sm:text-lg">
                      {formatCurrency(product.discounted_price || product.price)}
                    </span>
                    {product.discount_percentage > 0 && (
                      <span className="text-gray-400 text-[11px] line-through font-medium">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => onViewDetails(product)}
                      className="flex-1 py-2.5 rounded-xl text-[11px] sm:text-xs font-black border-2 border-indigo-50 text-indigo-600 hover:bg-indigo-50 active:scale-95 transition-all flex items-center justify-center gap-1.5 group/btn"
                    >
                      <svg className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      عرض
                    </button>
                    <button
                      onClick={() => onAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`flex-[1.5] py-2.5 rounded-xl text-[11px] sm:text-xs font-black transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md hover:shadow-indigo-200/50 ${
                        product.stock > 0
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8" />
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
        @keyframes cardIn {
          from { 
            opacity: 0; 
            transform: translateY(20px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        .animate-cardIn {
          animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </section>
  );
};

export default CategoryProductsSection;