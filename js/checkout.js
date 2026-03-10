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
    // Tự động điền thông tin từ tài khoản (tên, SĐT, địa chỉ đã lưu)
    prefillAddressFromUser();
    // Khởi tạo địa chỉ combobox (sẽ dùng dữ liệu đã set trước đó nếu có)
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

// Tự động điền địa chỉ từ tài khoản người dùng nếu có
function prefillAddressFromUser() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    
    const fullnameEl = document.getElementById('fullname');
    const phoneEl = document.getElementById('phone');
    const addressEl = document.getElementById('address');
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    if (fullnameEl && currentUser.fullName) fullnameEl.value = currentUser.fullName;
    if (phoneEl && currentUser.phone) phoneEl.value = currentUser.phone;
    
    if (addressEl) {
        addressEl.value = currentUser.addressDetail || currentUser.address || '';
    }

    if (provinceSelect) provinceSelect.dataset.initialName = currentUser.province || '';
    if (districtSelect) districtSelect.dataset.initialName = currentUser.district || '';
    if (wardSelect) wardSelect.dataset.initialName = currentUser.ward || '';
}

// Xác thực và gửi checkout
function validateAndSubmitCheckout() {
    const fullname = document.getElementById('fullname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const country = 'Việt Nam';
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    const provinceCode = provinceSelect ? provinceSelect.value.trim() : '';
    const districtCode = districtSelect ? districtSelect.value.trim() : '';
    const wardCode = wardSelect ? wardSelect.value.trim() : '';
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
    
    if (!provinceCode) {
        showNotification('Vui lòng chọn tỉnh/thành phố', 'error');
        return;
    }
    
    if (!districtCode) {
        showNotification('Vui lòng chọn quận/huyện', 'error');
        return;
    }
    
    if (!wardCode) {
        showNotification('Vui lòng chọn phường/xã', 'error');
        return;
    }
    
    if (!address) {
        showNotification('Vui lòng nhập địa chỉ chi tiết', 'error');
        return;
    }
    
    const provinceName = provinceSelect && provinceSelect.selectedIndex > 0
        ? provinceSelect.options[provinceSelect.selectedIndex].textContent
        : '';
    const districtName = districtSelect && districtSelect.selectedIndex > 0
        ? districtSelect.options[districtSelect.selectedIndex].textContent
        : '';
    const wardName = wardSelect && wardSelect.selectedIndex > 0
        ? wardSelect.options[wardSelect.selectedIndex].textContent
        : '';

    // Lưu thông tin người nhận
    const deliveryInfo = {
        fullname: fullname,
        phone: phone,
        country: country,
        province: provinceName,
        provinceCode: provinceCode,
        district: districtName,
        districtCode: districtCode,
        ward: wardName,
        wardCode: wardCode,
        addressDetail: address,
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
        'SAVE10': { type: 'percent', value: 0.1 },      // Giảm 10%
        'GIFT10': { type: 'percent', value: 0.1 },      // Giảm 10%
        'SAVE30': { type: 'percent', value: 0.3 },      // Giảm 30%
        'FREESHIP': { type: 'freeship', value: 0 },     // Free ship
        'SHIPFREE': { type: 'freeship', value: 0 }      // Free ship
    };
    
    if (!discountCodes[discountCode]) {
        showNotification('Mã giảm giá không hợp lệ', 'error');
        return;
    }
    
    const subtotal = parseInt(sessionStorage.getItem('checkoutSubtotal'));
    const shippingFee = parseInt(sessionStorage.getItem('checkoutShipping')) || 30000;
    let discount = 0;
    
    if (discountCodes[discountCode].type === 'percent') {
        // Giảm theo phần trăm
        discount = Math.floor(subtotal * discountCodes[discountCode].value);
    } else if (discountCodes[discountCode].type === 'freeship') {
        // Free ship - giảm bằng tiền ship
        discount = shippingFee;
        sessionStorage.setItem('checkoutShipping', '0');
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
    
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds());
    const phoneDigits = (deliveryInfo?.phone || '').replace(/\D/g, '');
    const last2 = phoneDigits.slice(-2) || '00';
    const dd = String(now.getDate()).padStart(2, '0');
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const orderId = `${hh}${mm}${ss}${ms}${last2}${dd}${MM}`;
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
    
    // Giảm số lượng tồn kho theo đơn hàng
    try {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        let changed = false;
        (cart || []).forEach(item => {
            const idx = products.findIndex(p => p.id == item.id);
            if (idx !== -1) {
                const currentQty = parseInt(products[idx].quantity) || 0;
                const reduceBy = parseInt(item.quantity) || 0;
                const newQty = Math.max(0, currentQty - reduceBy);
                products[idx].quantity = newQty;
                products[idx].status = newQty <= 0 ? 'out-of-stock' : 'in-stock';
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem('products', JSON.stringify(products));
        }
    } catch (err) {}
    
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

const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api';
let vnProvinces = null;
const vnDistrictsByProvince = {};
const vnWardsByDistrict = {};

async function fetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Request failed: ' + res.status);
    }
    return res.json();
}

// Khởi tạo combobox địa chỉ
function initAddressSelectors() {
    const provinceSelect = document.getElementById('province');
    const districtSelect = document.getElementById('district');
    const wardSelect = document.getElementById('ward');
    
    if (!provinceSelect || !districtSelect || !wardSelect) return;

    const initialProvinceName = provinceSelect.dataset.initialName || '';
    const initialDistrictName = districtSelect.dataset.initialName || '';
    const initialWardName = wardSelect.dataset.initialName || '';
    
    function setSelectState(select, placeholder, disabled) {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        select.disabled = !!disabled;
    }

    async function loadProvinces() {
        setSelectState(provinceSelect, 'Đang tải tỉnh/thành...', true);
        setSelectState(districtSelect, 'Chọn quận/huyện', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!vnProvinces) {
                vnProvinces = await fetchJson(`${PROVINCES_API_BASE}/p/`);
            }
            provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            vnProvinces
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = String(p.code);
                    opt.textContent = p.name;
                    provinceSelect.appendChild(opt);
                });
            provinceSelect.disabled = false;

            if (initialProvinceName) {
                const opt = Array.from(provinceSelect.options).find(o => o.textContent === initialProvinceName);
                if (opt) {
                    provinceSelect.value = opt.value;
                    await loadDistricts(opt.value, true);
                }
            }
        } catch (err) {
            setSelectState(provinceSelect, 'Không tải được tỉnh/thành', true);
            showNotification('Không tải được danh sách tỉnh/thành. Vui lòng thử lại.', 'error');
        }
    }

    async function loadDistricts(provinceCode, applyInitial) {
        if (!provinceCode) {
            setSelectState(districtSelect, 'Chọn quận/huyện', true);
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        setSelectState(districtSelect, 'Đang tải quận/huyện...', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!vnDistrictsByProvince[provinceCode]) {
                const data = await fetchJson(`${PROVINCES_API_BASE}/p/${provinceCode}?depth=2`);
                vnDistrictsByProvince[provinceCode] = data.districts || [];
            }
            const districts = vnDistrictsByProvince[provinceCode];
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districts
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = String(d.code);
                    opt.textContent = d.name;
                    districtSelect.appendChild(opt);
                });
            districtSelect.disabled = false;

            if (applyInitial && initialDistrictName) {
                const opt = Array.from(districtSelect.options).find(o => o.textContent === initialDistrictName);
                if (opt) {
                    districtSelect.value = opt.value;
                    await loadWards(opt.value, true);
                }
            }
        } catch (err) {
            setSelectState(districtSelect, 'Không tải được quận/huyện', true);
            showNotification('Không tải được danh sách quận/huyện. Vui lòng thử lại.', 'error');
        }
    }

    async function loadWards(districtCode, applyInitial) {
        if (!districtCode) {
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        setSelectState(wardSelect, 'Đang tải phường/xã...', true);
        try {
            if (!vnWardsByDistrict[districtCode]) {
                const data = await fetchJson(`${PROVINCES_API_BASE}/d/${districtCode}?depth=2`);
                vnWardsByDistrict[districtCode] = data.wards || [];
            }
            const wards = vnWardsByDistrict[districtCode];
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            wards
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = String(w.code);
                    opt.textContent = w.name;
                    wardSelect.appendChild(opt);
                });
            wardSelect.disabled = false;

            if (applyInitial && initialWardName) {
                const opt = Array.from(wardSelect.options).find(o => o.textContent === initialWardName);
                if (opt) {
                    wardSelect.value = opt.value;
                }
            }
        } catch (err) {
            setSelectState(wardSelect, 'Không tải được phường/xã', true);
            showNotification('Không tải được danh sách phường/xã. Vui lòng thử lại.', 'error');
        }
    }

    // Sự kiện thay đổi tỉnh/thành phố
    provinceSelect.addEventListener('change', function() {
        const selectedProvinceCode = this.value;
        districtSelect.dataset.initialName = '';
        wardSelect.dataset.initialName = '';
        loadDistricts(selectedProvinceCode, false);
    });
    
    // Sự kiện thay đổi quận/huyện
    districtSelect.addEventListener('change', function() {
        const selectedDistrictCode = this.value;
        wardSelect.dataset.initialName = '';
        loadWards(selectedDistrictCode, false);
    });

    // Mặc định luôn tải địa chỉ Việt Nam
    loadProvinces();
}
