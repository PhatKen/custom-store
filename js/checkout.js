// Khởi tạo trang checkout
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadCheckoutData();
    initCheckoutEvents();
});

// Tải dữ liệu giỏ hàng vào trang checkout
function loadCheckoutData() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Tính toán tổng cộng
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Hiển thị chi tiết đơn hàng
    displayOrderItems(cart);
    updateCheckoutSummary(subtotal, 0);
    
    // Lưu thông tin giỏ hàng vào session
    sessionStorage.setItem('checkoutCart', JSON.stringify(cart));
    sessionStorage.setItem('checkoutSubtotal', subtotal);
}

// Hiển thị các mục đơn hàng
function displayOrderItems(cart) {
    const orderItemsContainer = document.getElementById('order-items');
    
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="order-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p class="order-item-quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="order-item-price">
                <p class="unit-price">${item.price.toLocaleString('vi-VN')} ₫</p>
                <p class="total-price">${itemTotal.toLocaleString('vi-VN')} ₫</p>
            </div>
        `;
        
        orderItemsContainer.appendChild(itemElement);
    });
}

// Cập nhật tóm tắt checkout
function updateCheckoutSummary(subtotal, discount) {
    // Tính phí vận chuyển (tạm thời lấy từ input address)
    // Trong thực tế sẽ tính dựa trên địa chỉ giao hàng và cửa hàng
    let shippingFee = 20000; // Mặc định 20000 nếu trên 100m
    
    const total = subtotal + shippingFee - discount;
    
    document.getElementById('subtotal-checkout').textContent = subtotal.toLocaleString('vi-VN') + ' ₫';
    document.getElementById('shipping-fee-checkout').textContent = shippingFee.toLocaleString('vi-VN') + ' ₫';
    document.getElementById('discount-checkout').textContent = discount.toLocaleString('vi-VN') + ' ₫';
    document.getElementById('total-checkout').textContent = total.toLocaleString('vi-VN') + ' ₫';
    
    // Lưu thông tin
    sessionStorage.setItem('checkoutShipping', shippingFee);
    sessionStorage.setItem('checkoutDiscount', discount);
    sessionStorage.setItem('checkoutTotal', total);
}

// Khởi tạo sự kiện checkout
function initCheckoutEvents() {
    // Khởi tạo địa chỉ combobox
    initAddressSelectors();
    
    // Nút quay lại
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            window.location.href = 'cart.html';
        });
    }
    
    // Nút áp dụng mã giảm giá
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', function() {
            applyDiscountCode();
        });
    }
    
    // Form thanh toán
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateAndSubmitCheckout();
        });
    }
    
    // Sự kiện cho modal
    setupPaymentModals();
}

// Xác thực và gửi checkout
function validateAndSubmitCheckout() {
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const country = document.getElementById('country').value.trim();
    const province = document.getElementById('province').value.trim();
    const district = document.getElementById('district').value.trim();
    const ward = document.getElementById('ward').value.trim();
    const address = document.getElementById('address').value.trim();
    
    // Xác thực dữ liệu
    if (!fullname) {
        showNotification('Vui lòng nhập họ và tên', 'error');
        return;
    }
    
    if (!phone) {
        showNotification('Vui lòng nhập số điện thoại', 'error');
        return;
    }
    
    if (!country) {
        showNotification('Vui lòng chọn quốc gia', 'error');
        return;
    }
    
    if (!province) {
        showNotification('Vui lòng chọn tỉnh/thành phố', 'error');
        return;
    }
    
    if (!district) {
        showNotification('Vui lòng chọn quận/huyện', 'error');
        return;
    }
    
    if (!ward) {
        showNotification('Vui lòng chọn phường/xã', 'error');
        return;
    }
    
    if (!address) {
        showNotification('Vui lòng nhập địa chỉ chi tiết', 'error');
        return;
    }
    
    // Lưu thông tin người nhận
    const deliveryInfo = {
        fullname: fullname,
        phone: phone,
        country: country,
        province: province,
        district: district,
        ward: ward,
        address: address
    };
    
    sessionStorage.setItem('deliveryInfo', JSON.stringify(deliveryInfo));
    
    // Hiển thị modal chọn phương thức thanh toán
    showPaymentMethodModal();
}

// Áp dụng mã giảm giá
function applyDiscountCode() {
    const discountCode = document.getElementById('discount-code').value.trim();
    
    if (!discountCode) {
        showNotification('Vui lòng nhập mã giảm giá', 'error');
        return;
    }
    
    // Kiểm tra mã giảm giá (mô phỏng)
    const discountCodes = {
        'SAVE10': 0.1,  // Giảm 10%
        'SAVE20': 0.2,  // Giảm 20%
        'SAVE5K': -5000  // Giảm 5000đ
    };
    
    if (!discountCodes[discountCode]) {
        showNotification('Mã giảm giá không hợp lệ', 'error');
        return;
    }
    
    const subtotal = parseInt(sessionStorage.getItem('checkoutSubtotal'));
    let discount = 0;
    
    if (typeof discountCodes[discountCode] === 'number' && discountCodes[discountCode] < 0) {
        // Giảm tiền cố định
        discount = Math.abs(discountCodes[discountCode]);
    } else {
        // Giảm theo phần trăm
        discount = Math.floor(subtotal * discountCodes[discountCode]);
    }
    
    updateCheckoutSummary(subtotal, discount);
    showNotification('Áp dụng mã giảm giá thành công!', 'success');
    document.getElementById('discount-code').disabled = true;
}

// Thiết lập sự kiện modal
function setupPaymentModals() {
    const paymentModal = document.getElementById('payment-modal');
    const onlinePaymentModal = document.getElementById('online-payment-modal');
    
    // Các nút đóng modal
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Click ra ngoài modal để đóng
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Sự kiện cho các phương thức thanh toán chính
    document.querySelectorAll('.payment-method-option').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.getAttribute('data-method');
            handlePaymentMethod(method);
        });
    });
    
    // Sự kiện cho các phương thức thanh toán online
    document.querySelectorAll('[data-online-method]').forEach(btn => {
        btn.addEventListener('click', function() {
            const method = this.getAttribute('data-online-method');
            handleOnlinePayment(method);
        });
    });
}

// Hiển thị modal chọn phương thức thanh toán
function showPaymentMethodModal() {
    document.getElementById('payment-modal').style.display = 'flex';
}

// Xử lý phương thức thanh toán
function handlePaymentMethod(method) {
    if (method === 'cod') {
        // Thanh toán khi nhận hàng
        submitOrder('cod');
    } else if (method === 'online') {
        // Hiển thị modal chọn thanh toán online
        document.getElementById('payment-modal').style.display = 'none';
        document.getElementById('online-payment-modal').style.display = 'flex';
    }
}

// Xử lý thanh toán online
function handleOnlinePayment(method) {
    // Lưu phương thức thanh toán
    const paymentMethods = {
        'momo': 'Ví Momo',
        'bank': 'Chuyển Khoản Ngân Hàng',
        'visa': 'Thẻ Visa/MasterCard'
    };
    
    submitOrder('online_' + method, paymentMethods[method]);
}

// Gửi đơn hàng
function submitOrder(paymentMethod, paymentMethodName = null) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const deliveryInfo = JSON.parse(sessionStorage.getItem('deliveryInfo'));
    const cart = JSON.parse(sessionStorage.getItem('checkoutCart'));
    const subtotal = parseInt(sessionStorage.getItem('checkoutSubtotal'));
    const shippingFee = parseInt(sessionStorage.getItem('checkoutShipping'));
    const discount = parseInt(sessionStorage.getItem('checkoutDiscount'));
    const total = parseInt(sessionStorage.getItem('checkoutTotal'));
    
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để tiếp tục', 'error');
        return;
    }
    
    // Tạo đơn hàng
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    const orderId = 'ORD-' + Date.now();
    const newOrder = {
        id: orderId,
        userId: currentUser.id,
        items: cart,
        deliveryInfo: deliveryInfo,
        subtotal: subtotal,
        shippingFee: shippingFee,
        discount: discount,
        total: total,
        paymentMethod: paymentMethod,
        paymentMethodName: paymentMethodName || 'Thanh toán khi nhận hàng',
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Xóa giỏ hàng
    localStorage.removeItem('cart');
    updateCartCount();
    
    // Lưu thông tin đơn hàng để hiển thị trên trang delivery
    sessionStorage.setItem('lastOrder', JSON.stringify(newOrder));
    
    // Chuyển hướng đến trang delivery
    window.location.href = 'delivery.html';
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    document.body.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Dữ liệu địa chỉ Việt Nam
const vietnamAddressData = {
    'Ha Noi': {
        name: 'Hà Nội',
        districts: {
            'Ba Dinh': { name: 'Ba Đình', wards: ['Phúc Tân', 'Quán Thánh', 'Nguyễn Hữu Thọ', 'Kim Mã', 'Trúc Bạch', 'Cầu Giấy', 'Vĩnh Phúc'] },
            'Hai Ba Trung': { name: 'Hai Bà Trưng', wards: ['Bách Khoa', 'Giáp Bát', 'Hàng Bông', 'Hàng Giai', 'Lý Thái Tổ', 'Tràng Tây', 'Tràng Tiền'] },
            'Hoan Kiem': { name: 'Hoàn Kiếm', wards: ['Cửa Đông', 'Cửa Nam', 'Cửa Bắc', 'Hàng Bạc', 'Hàng Buồm', 'Thanh Nê'] },
            'Dong Da': { name: 'Đống Đa', wards: ['Hàng Bột', 'Lê Đại Hành', 'Phương Liên', 'Quỳnh Mai', 'Quỳnh Lôi', 'Thổ Quan', 'Nguyễn Du'] }
        }
    },
    'Ho Chi Minh': {
        name: 'Thành phố Hồ Chí Minh',
        districts: {
            'District 1': { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Cầu Kè', 'Cầu Ông Lãnh', 'Đa Kao', 'Nguyễn Hữu Cảnh', 'Phạm Ngũ Lão', 'Tân Định'] },
            'District 3': { name: 'Quận 3', wards: ['Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13'] },
            'District 5': { name: 'Quận 5', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'] },
            'District 7': { name: 'Quận 7', wards: ['Phú Mỹ', 'Tân Hưng', 'Tân Kiểng', 'Tân Phong', 'Tân Quy'] }
        }
    },
    'Da Nang': {
        name: 'Đà Nẵng',
        districts: {
            'Hai Chau': { name: 'Hải Châu', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10'] },
            'Thanh Khe': { name: 'Thanh Khê', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'] },
            'Cam Le': { name: 'Cẩm Lệ', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'] }
        }
    }
};

// Khởi tạo combobox địa chỉ
function initAddressSelectors() {
    const countrySelect = document.getElementById('country');
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    if (!countrySelect) return;
    
    // Sự kiện thay đổi quốc gia
    countrySelect.addEventListener('change', function() {
        const selectedCountry = this.value;
        
        // Xóa các lựa chọn cũ
        provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (selectedCountry === 'vietnam') {
            // Thêm các tỉnh/thành phố của Việt Nam
            Object.keys(vietnamAddressData).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = vietnamAddressData[key].name;
                provinceSelect.appendChild(option);
            });
        }
    });
    
    // Sự kiện thay đổi tỉnh/thành phố
    provinceSelect.addEventListener('change', function() {
        const selectedProvince = this.value;
        
        // Xóa các lựa chọn cũ
        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (selectedProvince && vietnamAddressData[selectedProvince]) {
            const province = vietnamAddressData[selectedProvince];
            Object.keys(province.districts).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = province.districts[key].name;
                districtSelect.appendChild(option);
            });
        }
    });
    
    // Sự kiện thay đổi quận/huyện
    districtSelect.addEventListener('change', function() {
        const selectedProvince = provinceSelect.value;
        const selectedDistrict = this.value;
        
        // Xóa các lựa chọn cũ
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (selectedProvince && selectedDistrict && vietnamAddressData[selectedProvince]) {
            const province = vietnamAddressData[selectedProvince];
            if (province.districts[selectedDistrict]) {
                const wards = province.districts[selectedDistrict].wards;
                wards.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward;
                    option.textContent = ward;
                    wardSelect.appendChild(option);
                });
            }
        }
    });
}
