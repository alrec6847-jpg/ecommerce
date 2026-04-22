
// كوبونات الخصم
let appliedCoupon = null;
let couponDiscount = 0;

// DOM Elements
const couponSection = document.getElementById('couponSection');
const couponInput = document.getElementById('couponInput');
const applyCouponBtn = document.getElementById('applyCouponBtn');
const couponMessage = document.getElementById('couponMessage');
const couponDiscountDisplay = document.getElementById('couponDiscount');
const removeCouponBtn = document.getElementById('removeCouponBtn');

// إضافة مستمعي الأحداث
if (applyCouponBtn) {
    applyCouponBtn.addEventListener('click', applyCoupon);
}

if (removeCouponBtn) {
    removeCouponBtn.addEventListener('click', removeCoupon);
}

if (couponInput) {
    couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            applyCoupon();
        }
    });
}

// تطبيق كوبون الخصم
async function applyCoupon() {
    const code = couponInput.value.trim();

    if (!code) {
        showCouponMessage('الرجاء إدخال كود الكوبون', 'error');
        return;
    }

    // الحصول على عناصر السلة
    const cartItems = getCartItemsForCoupon();
    const cartTotal = calculateCartTotal();

    try {
        showLoading();
        const response = await apiRequest('/coupons/apply/', {
            method: 'POST',
            body: JSON.stringify({
                code: code,
                cart_items: cartItems,
                cart_total: cartTotal
            })
        });

        if (response.success) {
            appliedCoupon = {
                id: response.coupon_id,
                code: response.coupon_code,
                discount: response.discount_amount
            };
            couponDiscount = response.discount_amount;

            // تحديث الواجهة
            showCouponMessage(response.message, 'success');
            displayCouponDiscount();
            updateCartTotal();

            // حفظ الكوبون في التخزين المحلي
            localStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
        } else {
            showCouponMessage(response.message, 'error');
        }
    } catch (error) {
        console.error('Error applying coupon:', error);
        showCouponMessage('حدث خطأ أثناء تطبيق الكوبون', 'error');
    } finally {
        hideLoading();
    }
}

// إزالة كوبون الخصم
function removeCoupon() {
    appliedCoupon = null;
    couponDiscount = 0;

    // تحديث الواجهة
    hideCouponSection();
    updateCartTotal();

    // إزالة الكوبون من التخزين المحلي
    localStorage.removeItem('appliedCoupon');
}

// عرض رسالة الكوبون
function showCouponMessage(message, type = 'info') {
    if (couponMessage) {
        couponMessage.textContent = message;
        couponMessage.className = `coupon-message ${type} show`;

        // إخفاء الرسالة بعد 5 ثوانٍ
        setTimeout(() => {
            couponMessage.classList.remove('show');
        }, 5000);
    }
}

// عرض خصم الكوبون
function displayCouponDiscount() {
    if (couponDiscountDisplay) {
        couponDiscountDisplay.textContent = `خصم الكوبون: ${couponDiscount} د.ع`;
        couponDiscountDisplay.classList.add('show');
    }

    if (removeCouponBtn) {
        removeCouponBtn.classList.add('show');
    }
}

// إخفاء قسم الكوبون
function hideCouponSection() {
    if (couponDiscountDisplay) {
        couponDiscountDisplay.classList.remove('show');
    }

    if (removeCouponBtn) {
        removeCouponBtn.classList.remove('show');
    }

    if (couponInput) {
        couponInput.value = '';
    }
}

// الحصول على عناصر السلة للكوبون
function getCartItemsForCoupon() {
    // تحويل عناصر السلة إلى التنسيق المطلوب للكوبون
    return cart.map(item => ({
        product_id: item.product_id,
        price: item.price || 0, // يجب إضافة السعر إلى عناصر السلة
        quantity: item.quantity
    }));
}

// حساب إجمالي السلة
function calculateCartTotal() {
    return cart.reduce((total, item) => {
        return total + (item.price || 0) * item.quantity;
    }, 0);
}

// تحديث إجمالي السلة مع خصم الكوبون
function updateCartTotal() {
    const cartTotalElement = document.getElementById('cartTotal');
    if (cartTotalElement) {
        const subtotal = calculateCartTotal();
        const total = subtotal - couponDiscount;
        cartTotalElement.textContent = total.toLocaleString();
    }
}

// استعادة الكوبون من التخزين المحلي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    if (savedCoupon) {
        try {
            appliedCoupon = JSON.parse(savedCoupon);
            couponDiscount = appliedCoupon.discount;
            displayCouponDiscount();
            updateCartTotal();
        } catch (error) {
            console.error('Error parsing saved coupon:', error);
            localStorage.removeItem('appliedCoupon');
        }
    }
});

// تحديث دالة displayCart في script.js لدعم الكوبونات
function displayCartWithCoupons() {
    displayCart();

    if (appliedCoupon && cart.length > 0) {
        displayCouponDiscount();
        updateCartTotal();
    } else {
        hideCouponSection();
    }
}

// تحديث دالة addToCart في script.js لإعادة حساب خصم الكوبون
function addToCartWithCoupon(productId) {
    addToCart(productId);

    if (appliedCoupon) {
        // إعادة تطبيق الكوبون بعد إضافة منتج جديد
        const code = appliedCoupon.code;
        removeCoupon();
        couponInput.value = code;
        applyCoupon();
    }
}
