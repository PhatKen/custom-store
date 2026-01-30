[file content begin]
// Khởi tạo trang giỏ hàng
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để xem giỏ hàng!', 'error');
        // Chuyển hướng đến trang đăng nhập sau 1.5 giây
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Tải giỏ hàng
    loadCart();
    
    // Khởi tạo các sự kiện
    initCartEvents();
    
    // Tải sản phẩm đề xuất
    loadRecommendedProducts();
});

// Tải giỏ hàng
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    displayCartItems(cart);
    updateCartSummary(cart);
    updateCartCount();
}

// Hiển thị các mục trong giỏ hàng
function displayCartItems(cart) {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    
    if (!cartItemsContainer) return;
    
    // Xóa tất cả các mục hiện tại (trừ thông báo giỏ hàng trống)
    const existingItems = cartItemsContainer.querySelectorAll('.cart-item');
    existingItems.forEach(item => item.remove());
    
    if (cart.length === 0) {
        if (emptyCartMessage) {
            emptyCartMessage.style.display = 'block';
        }
        return;
    }
    
    // Ẩn thông báo giỏ hàng trống
    if (emptyCartMessage) {
        emptyCartMessage.style.display = 'none';
    }
    
    // Hiển thị từng mục trong giỏ hàng
    cart.forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItemsContainer.appendChild(cartItem);
    });
}

// Tạo phần tử mục giỏ hàng
function createCartItemElement(item) {
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.setAttribute('data-product-id', item.id);
    
    // Format giá tiền
    const formattedPrice = item.price.toLocaleString('vi-VN') + ' VNĐ';
    const itemTotal = (item.price * item.quantity).toLocaleString('vi-VN') + ' VNĐ';
    
    // Lấy tên danh mục
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón'
    };
    
    cartItem.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="cart-item-details">
            <h4>${item.name}</h4>
            <span class="cart-item-category">${categoryNames[item.category]}</span>
        </div>
        <div class="cart-item-price">${formattedPrice}</div>
        <div class="cart-item-quantity">
            <button class="quantity-btn decrease-btn" data-product-id="${item.id}">-</button>
            <span class="quantity-value">${item.quantity}</span>
            <button class="quantity-btn increase-btn" data-product-id="${item.id}">+</button>
        </div>
        <div class="cart-item-total">${itemTotal}</div>
        <div class="cart-item-actions">
            <button class="cart-item-remove" data-product-id="${item.id}">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return cartItem;
}

// Cập nhật tổng kết giỏ hàng
function updateCartSummary(cart) {
    // Tính tổng phụ
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    // Phí vận chuyển cố định
    const shippingFee = 30000;
    
    // Giảm giá (tạm thời để 0)
    const discount = 0;
    
    // Tổng cộng
    const total = subtotal + shippingFee - discount;
    
    // Cập nhật DOM
    document.getElementById('subtotal').textContent = subtotal.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('shipping-fee').textContent = shippingFee.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('discount').textContent = discount.toLocaleString('vi-VN') + ' VNĐ';
    document.getElementById('total').textContent = total.toLocaleString('vi-VN') + ' VNĐ';
}

// Khởi tạo các sự kiện giỏ hàng
function initCartEvents() {
    // Sự kiện cho nút tăng/giảm số lượng
    document.addEventListener('click', function(e) {
        // Tăng số lượng
        if (e.target.classList.contains('increase-btn') || e.target.closest('.increase-btn')) {
            const button = e.target.classList.contains('increase-btn') ? e.target : e.target.closest('.increase-btn');
            const productId = button.getAttribute('data-product-id');
            updateQuantity(productId, 1);
        }
        
        // Giảm số lượng
        if (e.target.classList.contains('decrease-btn') || e.target.closest('.decrease-btn')) {
            const button = e.target.classList.contains('decrease-btn') ? e.target : e.target.closest('.decrease-btn');
            const productId = button.getAttribute('data-product-id');
            updateQuantity(productId, -1);
        }
        
        // Xóa sản phẩm
        if (e.target.classList.contains('cart-item-remove') || e.target.closest('.cart-item-remove')) {
            const button = e.target.classList.contains('cart-item-remove') ? e.target : e.target.closest('.cart-item-remove');
            const productId = button.getAttribute('data-product-id');
            removeFromCart(productId);
        }
    });
    
    // Sự kiện áp dụng mã giảm giá
    const applyCouponBtn = document.getElementById('apply-coupon');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }
    
    // Sự kiện thanh toán
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Sự kiện đóng modal
    const closeModalButtons = document.querySelectorAll('.close-modal');
    closeModalButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Đóng modal khi click ra ngoài
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Cập nhật số lượng sản phẩm
function updateQuantity(productId, change) {
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Tìm sản phẩm trong giỏ hàng
    const itemIndex = cart.findIndex(item => item.id == productId);
    
    if (itemIndex === -1) return;
    
    // Cập nhật số lượng
    const newQuantity = cart[itemIndex].quantity + change;
    
    // Nếu số lượng mới là 0 hoặc nhỏ hơn, xóa sản phẩm khỏi giỏ hàng
    if (newQuantity <= 0) {
        cart.splice(itemIndex, 1);
    } else {
        // Cập nhật số lượng
        cart[itemIndex].quantity = newQuantity;
    }
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật hiển thị
    loadCart();
}

// Xóa sản phẩm khỏi giỏ hàng
function removeFromCart(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?')) {
        return;
    }
    
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Lọc ra sản phẩm cần xóa
    cart = cart.filter(item => item.id != productId);
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật hiển thị
    loadCart();
    
    // Hiển thị thông báo
    showNotification('Đã xóa sản phẩm khỏi giỏ hàng', 'success');
}

// Áp dụng mã giảm giá
function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim();
    
    if (!couponCode) {
        showNotification('Vui lòng nhập mã giảm giá', 'error');
        return;
    }
    
    // Kiểm tra mã giảm giá (trong thực tế, kiểm tra với server)
    const validCoupons = {
        'SALE10': 0.1,  // Giảm 10%
        'SALE20': 0.2,  // Giảm 20%
        'SALE50': 0.5   // Giảm 50%
    };
    
    if (validCoupons[couponCode]) {
        const discountRate = validCoupons[couponCode];
        
        // Lấy giỏ hàng từ localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Tính giảm giá
        const discount = Math.floor(subtotal * discountRate);
        
        // Cập nhật tổng kết
        const shippingFee = 30000;
        const total = subtotal + shippingFee - discount;
        
        // Cập nhật DOM
        document.getElementById('discount').textContent = discount.toLocaleString('vi-VN') + ' VNĐ';
        document.getElementById('total').textContent = total.toLocaleString('vi-VN') + ' VNĐ';
        
        // Lưu mã giảm giá vào localStorage
        localStorage.setItem('appliedCoupon', couponCode);
        
        // Hiển thị thông báo
        showNotification(`Áp dụng mã giảm giá thành công! Giảm ${discountRate * 100}%`, 'success');
    } else {
        showNotification('Mã giảm giá không hợp lệ hoặc đã hết hạn', 'error');
    }
}

// Thanh toán
function checkout() {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thanh toán!', 'error');
        // Chuyển hướng đến trang đăng nhập sau 1.5 giây
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Lấy giỏ hàng từ localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (cart.length === 0) {
        showNotification('Giỏ hàng của bạn đang trống', 'error');
        return;
    }
    
    // Hiển thị modal thanh toán
    showCheckoutModal(cart);
}

// Hiển thị modal thanh toán
function showCheckoutModal(cart) {
    // Tính tổng tiền
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shippingFee = 30000;
    const discount = localStorage.getItem('appliedCoupon') ? parseInt(document.getElementById('discount').textContent.replace(/[^0-9]/g, '')) : 0;
    const total = subtotal + shippingFee - discount;
    
    // Tạo HTML cho tóm tắt đơn hàng
    let summaryHTML = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        summaryHTML += `
            <div class="summary-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${itemTotal.toLocaleString('vi-VN')} VNĐ</span>
            </div>
        `;
    });
    
    summaryHTML += `
        <div class="summary-item">
            <span>Phí vận chuyển</span>
            <span>${shippingFee.toLocaleString('vi-VN')} VNĐ</span>
        </div>
    `;
    
    if (discount > 0) {
        summaryHTML += `
            <div class="summary-item">
                <span>Giảm giá</span>
                <span>-${discount.toLocaleString('vi-VN')} VNĐ</span>
            </div>
        `;
    }
    
    // Hiển thị modal
    const modal = document.getElementById('checkout-modal');
    const checkoutSummary = document.getElementById('checkout-summary');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutSummary) {
        checkoutSummary.innerHTML = summaryHTML;
    }
    
    if (checkoutTotal) {
        checkoutTotal.textContent = total.toLocaleString('vi-VN') + ' VNĐ';
    }
    
    modal.style.display = 'flex';
    
    // Xử lý form thanh toán
    const checkoutForm = document.getElementById('checkout-form');
    checkoutForm.onsubmit = function(e) {
        e.preventDefault();
        
        // Lấy thông tin từ form
        const fullname = document.getElementById('fullname').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        
        // Tạo đơn hàng
        const order = {
            id: generateOrderId(),
            customerName: fullname,
            customerPhone: phone,
            customerEmail: email,
            customerAddress: address,
            paymentMethod: paymentMethod,
            items: cart,
            subtotal: subtotal,
            shippingFee: shippingFee,
            discount: discount,
            total: total,
            status: 'pending',
            createdAt: new Date().toISOString()
        };
        
        // Lưu đơn hàng vào localStorage
        saveOrder(order);
        
        // Xóa giỏ hàng
        localStorage.removeItem('cart');
        localStorage.removeItem('appliedCoupon');
        
        // Đóng modal thanh toán
        modal.style.display = 'none';
        
        // Hiển thị modal thành công
        showSuccessModal(order.id);
    };
}

// Tạo ID đơn hàng mới
function generateOrderId() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) return 1001;
    
    const maxId = Math.max(...orders.map(o => o.id));
    return maxId + 1;
}

// Lưu đơn hàng
function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// Hiển thị modal thành công
function showSuccessModal(orderId) {
    const successModal = document.getElementById('success-modal');
    const orderIdElement = document.getElementById('order-id');
    
    if (orderIdElement) {
        orderIdElement.textContent = `#ORD-${orderId}`;
    }
    
    successModal.style.display = 'flex';
    
    // Sự kiện cho nút xem chi tiết đơn hàng
    const viewOrderBtn = document.getElementById('view-order-details');
    if (viewOrderBtn) {
        viewOrderBtn.addEventListener('click', function() {
            // Trong thực tế, chuyển hướng đến trang chi tiết đơn hàng
            alert(`Chi tiết đơn hàng #ORD-${orderId} sẽ được hiển thị tại đây.`);
        });
    }
}

// Tải sản phẩm đề xuất
function loadRecommendedProducts() {
    const recommendedContainer = document.getElementById('recommended-products');
    
    if (!recommendedContainer) return;
    
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Lấy ngẫu nhiên 4 sản phẩm
    const recommendedProducts = [...products]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);
    
    // Hiển thị sản phẩm đề xuất
    displayRecommendedProducts(recommendedProducts, recommendedContainer);
}

// Hiển thị sản phẩm đề xuất
function displayRecommendedProducts(products, container) {
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>Không có sản phẩm đề xuất</p>';
        return;
    }
    
    products.forEach(product => {
        const productCard = createRecommendedProductCard(product);
        container.appendChild(productCard);
    });
}

// Tạo card sản phẩm đề xuất
function createRecommendedProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Format giá tiền
    const formattedPrice = product.price.toLocaleString('vi-VN') + ' VNĐ';
    
    // Lấy tên danh mục
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón'
    };
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[product.category]}</span>
            <h3 class="product-name">${product.name}</h3>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-actions">
                <button class="btn-add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
            </div>
        </div>
    `;
    
    // Thêm sự kiện cho nút thêm vào giỏ
    const addToCartBtn = card.querySelector('.btn-add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(product.id);
    });
    
    return card;
}

// Thêm sản phẩm vào giỏ hàng (tương tự hàm trong main.js)
function addToCart(productId) {
    // Kiểm tra đăng nhập
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        showNotification('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'error');
        // Chuyển hướng đến trang đăng nhập sau 1.5 giây
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Sản phẩm không tồn tại!', 'error');
        return;
    }
    
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => item.id == productId);
    
    if (existingItemIndex !== -1) {
        // Tăng số lượng nếu sản phẩm đã có trong giỏ
        cart[existingItemIndex].quantity += 1;
    } else {
        // Thêm sản phẩm mới vào giỏ
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Lưu giỏ hàng vào localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng giỏ hàng
    updateCartCount();
    
    // Tải lại giỏ hàng
    loadCart();
    
    // Hiển thị thông báo
    showNotification(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
}

// Cập nhật số lượng giỏ hàng (tương tự hàm trong main.js)
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cart-count');
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Tính tổng số lượng sản phẩm trong giỏ
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Cập nhật tất cả các phần tử hiển thị số lượng giỏ hàng
    cartCountElements.forEach(element => {
        element.textContent = totalItems;
    });
}

// Hiển thị thông báo (tương tự hàm trong main.js)
function showNotification(message, type = 'info') {
    // Tạo thông báo
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">&times;</button>
    `;
    
    // Thêm thông báo vào body
    document.body.appendChild(notification);
    
    // Xóa thông báo khi nhấn nút đóng
    notification.querySelector('.notification-close').addEventListener('click', function() {
        notification.remove();
    });
    
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}