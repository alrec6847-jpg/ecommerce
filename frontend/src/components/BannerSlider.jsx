import React, { useState, useEffect } from 'react';
import { api, endpoints } from '../api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BannerSlider = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await api.get(endpoints.banners);
        console.log('Banners data:', response.data);
        setBanners(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching banners:', err);
        setError('Failed to load banners');
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
  };

  const handleBannerClick = (banner) => {
    console.log('Banner clicked:', banner);
    console.log('Banner link:', banner.link);
    console.log('Banner product_id:', banner.product_id);
    console.log('Banner category_id:', banner.category_id);

    if (banner.link && banner.link !== '#') {
      if (banner.link.startsWith('http')) {
        window.open(banner.link, '_blank');
      } else {
        console.log('Navigating to link:', banner.link);
        navigate(banner.link);
      }
    } else if (banner.product_id) {
      console.log('Navigating to product by ID:', banner.product_id);
      navigate(`/product/${banner.product_id}`);
    } else if (banner.category_id) {
      console.log('Navigating to category by ID:', banner.category_id);
      navigate(`/category/${banner.category_id}`);
    } else {
      console.log('No valid link found for banner');
    }
  };

  if (loading) {
    return (
      <div className="w-screen h-48 sm:h-64 md:h-96 bg-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-48 sm:h-64 md:h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (banners.length === 0) {
    return (
      <div className="w-screen h-48 sm:h-64 md:h-96 bg-gray-200 flex items-center justify-center">
        <p className="text-gray-500">No banners available</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-48 sm:h-64 md:h-96 overflow-hidden bg-gray-100">
      <div className="relative w-full h-full flex items-center justify-center">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              index === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="w-full h-full cursor-pointer"
              onClick={() => handleBannerClick(banner)}
            >
              <img
                src={banner.image.startsWith('http') 
                  ? banner.image 
                  : banner.image.startsWith('/media/') 
                    ? `https://ecom-parent-project.onrender.com${banner.image}`
                    : `https://ecom-parent-project.onrender.com/media/${banner.image}`}
                onLoad={() => console.log('Banner image loaded successfully')}
                onError={(e) => {
                  console.error('Error loading banner image:', e, banner.image);
                  e.target.onerror = null;
                  const parent = e.target.parentNode;
                  if (parent && !parent.querySelector('.banner-error')) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'banner-error absolute inset-0 flex items-center justify-center bg-gray-200';
                    errorDiv.innerHTML = `
                      <div class="text-center p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p class="text-gray-500">${banner.title || 'Banner Image'}</p>
                      </div>
                    `;
                    parent.appendChild(errorDiv);
                  }
                  e.target.style.display = 'none';
                }}
                alt={banner.title}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={goToNext}
            className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
            aria-label="Next banner"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goToPrevious}
            className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 md:p-3 rounded-full hover:bg-opacity-75 transition-all z-10"
            aria-label="Previous banner"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {banners.length > 1 && (
        <div className="absolute bottom-3 md:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-3 md:w-4' : 'bg-white bg-opacity-50'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;
