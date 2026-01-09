import React, { useRef, useState, useEffect } from 'react';

const CategorySlider = ({ categories, selectedCategory, onCategorySelect }) => {
  const sliderRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    updateScrollButtons();
    window.addEventListener('resize', updateScrollButtons);
    return () => window.removeEventListener('resize', updateScrollButtons);
  }, [categories]);

  const updateScrollButtons = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === 'right'
          ? sliderRef.current.scrollLeft + scrollAmount
          : sliderRef.current.scrollLeft - scrollAmount;

      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });

      setTimeout(updateScrollButtons, 300);
    }
  };

  return (
    <section className="py-6 bg-gradient-to-br from-white via-gray-50 to-white border-b border-gray-200 sticky top-14 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative group">
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="scroll left"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div
            ref={sliderRef}
            className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide pb-2"
            style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <button
              onClick={() => onCategorySelect('')}
              className={`relative px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 group/btn flex items-center gap-2 overflow-hidden ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
              }`}
            >
              <svg className="h-4 w-4 transition-transform duration-300 group-hover/btn:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>الكل</span>
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                className={`relative px-5 sm:px-6 py-2.5 sm:py-3 rounded-full font-semibold whitespace-nowrap transition-all duration-300 flex-shrink-0 group/btn overflow-hidden ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-600 text-white shadow-lg shadow-primary-500/30 scale-105'
                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-secondary-50 border border-gray-200 hover:border-primary-300 hover:text-primary-600 hover:shadow-md'
                }`}
              >
                <span className="relative z-10 flex items-center">
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <span className="absolute inset-0 -z-10 opacity-20 blur-lg bg-gradient-to-r from-primary-500 to-secondary-600"></span>
                )}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-gradient-to-r from-secondary-600 to-primary-500 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 opacity-0 group-hover:opacity-100"
              aria-label="scroll right"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default CategorySlider;