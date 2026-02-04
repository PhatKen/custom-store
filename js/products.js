// Khởi tạo trang sản phẩm
document.addEventListener('DOMContentLoaded', function() {
    // Cập nhật header theo trạng thái đăng nhập
    updateUserHeader();
    
    // Cập nhật số lượng giỏ hàng
    updateCartCount();
    
    // Tải sản phẩm
    loadProductsPage();
    
    // Khởi tạo các sự kiện filter
    initFilterEvents();
    
    // Lấy category từ URL query parameter nếu có
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        document.getElementById('filter-category').value = category;
        applyFilters();
    }
    
    // Khởi tạo listener để theo dõi thay đổi sản phẩm từ admin
    initProductsChangeListener();
});

// Listener để theo dõi thay đổi sản phẩm từ các tab/cửa sổ khác
function initProductsChangeListener() {
    // Listener cho storage event (khi thay đổi từ tab/cửa sổ khác)
    window.addEventListener('storage', function(e) {
        // Kiểm tra nếu có thay đổi trong products
        if (e.key === 'products' && e.newValue) {
            // Tải lại sản phẩm và cập nhật giao diện
            const oldProducts = e.oldValue ? JSON.parse(e.oldValue) : [];
            const newProducts = JSON.parse(e.newValue);
            
            // Nếu số lượng sản phẩm hoặc nội dung thay đổi, tải lại trang
            if (JSON.stringify(oldProducts) !== JSON.stringify(newProducts)) {
                // Giữ nguyên các giá trị filter hiện tại
                applyFilters();
                
                // Hiển thị thông báo cập nhật
                showProductsUpdateNotification();
            }
        }
    });
    
    // Listener cho custom event (khi thay đổi từ cùng tab)
    window.addEventListener('productsUpdated', function() {
        // Tải lại sản phẩm và giữ nguyên filter
        applyFilters();
        
        // Hiển thị thông báo cập nhật
        showProductsUpdateNotification();
    });
}

// Tải và hiển thị sản phẩm
function loadProductsPage() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (products.length === 0) {
        // Nếu không có sản phẩm, tạo dữ liệu mẫu (từ main.js)
        getSampleProductsAndInitialize();
        const updatedProducts = JSON.parse(localStorage.getItem('products')) || [];
        displayProductsWithFilters(updatedProducts);
    } else {
        displayProductsWithFilters(products);
    }
}

// Lấy sản phẩm mẫu và khởi tạo (copy logic từ main.js)
function getSampleProductsAndInitialize() {
    let products = [
        {
            id: 1,
            name: 'Áo thun basic nam nữ',
            category: 'ao',
            price: 199000,
            description: 'Áo thun basic chất liệu cotton thoáng mát, dễ phối đồ',
            image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 50,
            createdAt: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Quần jeans slimfit',
            category: 'quan',
            price: 450000,
            description: 'Quần jeans slimfit chất liệu denim cao cấp, form ôm vừa vặn',
            image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 30,
            createdAt: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Giày thể thao Nike',
            category: 'giay',
            price: 1200000,
            description: 'Giày thể thao Nike chính hãng, êm ái và bền đẹp',
            image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 20,
            createdAt: new Date().toISOString()
        },
        {
            id: 4,
            name: 'Nón lưỡi trai thời trang',
            category: 'non',
            price: 150000,
            description: 'Nón lưỡi trai unisex, nhiều màu sắc, chất liệu vải cao cấp',
            image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 45,
            createdAt: new Date().toISOString()
        },
        {
            id: 5,
            name: 'Áo sơ mi nam công sở',
            category: 'ao',
            price: 350000,
            description: 'Áo sơ mi nam form regular, chất liệu vải lụa mát mẻ',
            image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 25,
            createdAt: new Date().toISOString()
        },
        {
            id: 6,
            name: 'Quần short kaki',
            category: 'quan',
            price: 280000,
            description: 'Quần short kaki nam nữ, chất liệu thấm hút tốt, thoáng mát',
            image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 40,
            createdAt: new Date().toISOString()
        },
        {
            id: 7,
            name: 'Giày sandal nữ',
            category: 'giay',
            price: 320000,
            description: 'Giày sandal nữ quai ngang, đế bằng êm ái, nhiều màu sắc',
            image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 35,
            createdAt: new Date().toISOString()
        },
        {
            id: 8,
            name: 'Nón rộng vành nữ',
            category: 'non',
            price: 220000,
            description: 'Nón rộng vành nữ đi biển, chất liệu cói tự nhiên, nhẹ nhàng',
            image: 'https://images.unsplash.com/photo-1534215754734-18e55d13e346?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            quantity: 28,
            createdAt: new Date().toISOString()
        }
    ];
    
    localStorage.setItem('products', JSON.stringify(products));
}

// Khởi tạo các sự kiện filter
function initFilterEvents() {
    // Search by name
    document.getElementById('search-name').addEventListener('input', applyFilters);
    
    // Sort by name
    document.getElementById('sort-name').addEventListener('change', applyFilters);
    
    // Sort by price
    document.getElementById('sort-price').addEventListener('change', applyFilters);
    
    // Filter by category
    document.getElementById('filter-category').addEventListener('change', applyFilters);
    
    // Price range filter
    document.getElementById('price-min').addEventListener('input', applyFilters);
    document.getElementById('price-max').addEventListener('input', applyFilters);
    
    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// Áp dụng các filter
function applyFilters() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Lấy giá trị từ các filter
    const searchName = document.getElementById('search-name').value.toLowerCase();
    const sortName = document.getElementById('sort-name').value;
    const sortPrice = document.getElementById('sort-price').value;
    const filterCategory = document.getElementById('filter-category').value;
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Infinity;
    
    // Lọc sản phẩm
    let filteredProducts = products.filter(product => {
        // Filter by name
        const matchName = product.name.toLowerCase().includes(searchName);
        
        // Filter by category
        const matchCategory = filterCategory === 'all' || product.category === filterCategory;
        
        // Filter by price
        const matchPrice = product.price >= priceMin && product.price <= priceMax;
        
        return matchName && matchCategory && matchPrice;
    });
    
    // Sắp xếp theo tên
    if (sortName === 'a-z') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    } else if (sortName === 'z-a') {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name, 'vi'));
    }
    
    // Sắp xếp theo giá
    if (sortPrice === 'low-high') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortPrice === 'high-low') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }
    
    // Hiển thị sản phẩm
    displayProductsList(filteredProducts);
}

// Hiển thị danh sách sản phẩm
function displayProductsList(products) {
    const container = document.getElementById('products-container');
    const showingCount = document.getElementById('showing-count');
    
    container.innerHTML = '';
    showingCount.textContent = products.length;
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray-color); margin-bottom: 20px; display: block;"></i>
                <h3 style="color: var(--gray-color);">Không tìm thấy sản phẩm</h3>
                <p style="color: var(--gray-color);">Hãy thử thay đổi các bộ lọc của bạn</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const card = createProductCardForPage(product);
        container.appendChild(card);
    });
}

// Tạo card sản phẩm cho trang sản phẩm
function createProductCardForPage(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    
    // Format giá tiền
    const formattedPrice = product.price.toLocaleString('vi-VN') + ' VNĐ';
    
    // Lấy tên danh mục
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón'
    };
    
    // Kiểm tra trạng thái đăng nhập
    const loggedIn = isUserLoggedIn();
    
    // Kiểm tra trạng thái hàng
    const isOutOfStock = product.status === 'out-of-stock' || product.quantity === 0;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
            ${isOutOfStock ? '<div class="out-of-stock-badge">Hết hàng</div>' : ''}
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[product.category]}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-actions">
                ${loggedIn ? 
                    `<button class="btn-add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>` 
                    : 
                    `<div class="btn-login-required">
                        <i class="fas fa-lock"></i> Hãy đăng nhập
                    </div>`
                }
                <button class="btn-view" data-product-id="${product.id}">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
            </div>
        </div>
    `;
    
    // Thêm sự kiện cho nút thêm vào giỏ nếu đã đăng nhập và sản phẩm còn hàng
    if (loggedIn && !isOutOfStock) {
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', function() {
            addToCart(product.id);
        });
    }
    
    // Thêm sự kiện cho nút xem chi tiết
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    return card;
}

// Hiển thị sản phẩm ban đầu
function displayProductsWithFilters(products) {
    displayProductsList(products);
}

// Đặt lại các filter
function resetFilters() {
    document.getElementById('search-name').value = '';
    document.getElementById('sort-name').value = 'none';
    document.getElementById('sort-price').value = 'none';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    
    // Áp dụng filter để tải lại danh sách
    applyFilters();
}

// Kiểm tra người dùng đã đăng nhập hay chưa
function isUserLoggedIn() {
    return JSON.parse(localStorage.getItem('currentUser')) !== null;
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
    // Kiểm tra người dùng đã đăng nhập chưa
    if (!isUserLoggedIn()) {
        showNotification('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!', 'warning');
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
    
    // Kiểm tra số lượng tồn kho
    if (product.quantity <= 0) {
        showNotification('Sản phẩm đã hết hàng!', 'error');
        return;
    }
    
    // Lấy giỏ hàng từ localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.findIndex(item => item.id == productId);
    
    if (existingItemIndex !== -1) {
        // Kiểm tra số lượng trong giỏ không vượt quá tồn kho
        if (cart[existingItemIndex].quantity >= product.quantity) {
            showNotification('Đã đạt số lượng tối đa trong kho!', 'error');
            return;
        }
        // Tăng số lượng
        cart[existingItemIndex].quantity += 1;
    } else {
        // Thêm sản phẩm mới
        cart.push({
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    // Lưu giỏ hàng
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Cập nhật số lượng giỏ hàng
    updateCartCount();
    
    // Hiển thị thông báo
    showNotification(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
}

// Xem chi tiết sản phẩm - Kế thừa chức năng từ main.js
function viewProductDetail(productId) {
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Sản phẩm không tồn tại!', 'error');
        return;
    }
    
    // Hiển thị modal chi tiết sản phẩm (giống trang chủ)
    showProductDetailModal(product);
}

// Hiển thị thông báo
function showNotification(message, type = 'info') {
    // Tạo thông báo
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Thêm CSS cho thông báo nếu chưa có
    if (!document.querySelector('.notification-styles')) {
        const style = document.createElement('style');
        style.className = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: white;
                border-radius: var(--border-radius);
                padding: 15px 20px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
                display: flex;
                align-items: center;
                gap: 10px;
                z-index: 10000;
                max-width: 400px;
                animation: slideInRight 0.3s ease, fadeOut 0.3s ease 2.7s forwards;
                border-left: 4px solid var(--primary-color);
            }
            
            .notification-success {
                border-left-color: var(--success-color);
            }
            
            .notification-error {
                border-left-color: var(--danger-color);
            }
            
            .notification-warning {
                border-left-color: var(--warning-color);
            }
            
            .notification-info {
                border-left-color: var(--primary-color);
            }
            
            .notification-content i {
                font-size: 20px;
            }
            
            .notification-success .notification-content i {
                color: var(--success-color);
            }
            
            .notification-error .notification-content i {
                color: var(--danger-color);
            }
            
            .notification-warning .notification-content i {
                color: var(--warning-color);
            }
            
            .notification-info .notification-content i {
                color: var(--primary-color);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Thêm thông báo vào body
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Hiển thị thông báo khi sản phẩm được cập nhật
function showProductsUpdateNotification() {
    const notification = document.createElement('div');
    notification.className = 'notification notification-info';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-sync-alt"></i>
            <span>Sản phẩm đã được cập nhật từ quản lý</span>
        </div>
    `;
    
    // Kiểm tra nếu style chưa được thêm
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.innerHTML = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                z-index: 9999;
                animation: slideInRight 0.3s ease-out;
                border-left: 4px solid;
                max-width: 400px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .notification-info {
                border-left-color: var(--primary-color);
            }
            
            .notification-content i {
                font-size: 18px;
                animation: spin 2s linear infinite;
            }
            
            .notification-info .notification-content i {
                color: var(--primary-color);
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes spin {
                from {
                    transform: rotate(0deg);
                }
                to {
                    transform: rotate(360deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Thêm thông báo vào body
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 3 giây
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}
