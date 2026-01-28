// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo menu mobile
    initMobileMenu();
    
    // Khởi tạo bộ lọc sản phẩm
    initProductFilter();
    
    // Tải sản phẩm
    loadProducts();
    
    // Cập nhật số lượng giỏ hàng
    updateCartCount();
    
    // Khởi tạo hiệu ứng scroll mượt
    initSmoothScroll();
});

// Khởi tạo menu mobile
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            menuToggle.querySelector('i').classList.toggle('fa-bars');
            menuToggle.querySelector('i').classList.toggle('fa-times');
        });
    }
}

// Khởi tạo bộ lọc sản phẩm
function initProductFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productsContainer = document.getElementById('products-container');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Xóa active class khỏi tất cả các nút
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Thêm active class cho nút được nhấn
            this.classList.add('active');
            
            // Lọc sản phẩm
            const filter = this.getAttribute('data-filter');
            filterProducts(filter);
        });
    });
}

// Lọc sản phẩm theo danh mục
function filterProducts(category) {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 10);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

// Tải sản phẩm từ localStorage hoặc tạo dữ liệu mẫu
function loadProducts() {
    const productsContainer = document.getElementById('products-container');
    
    // Lấy sản phẩm từ localStorage
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Nếu không có sản phẩm trong localStorage, tạo dữ liệu mẫu
    if (products.length === 0) {
        products = getSampleProducts();
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Hiển thị sản phẩm
    displayProducts(products);
}

// Tạo dữ liệu sản phẩm mẫu
function getSampleProducts() {
    return [
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
}

// Hiển thị sản phẩm lên trang
function displayProducts(products) {
    const productsContainer = document.getElementById('products-container');
    
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    
    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-products">
                <i class="fas fa-box-open"></i>
                <h3>Không có sản phẩm nào</h3>
                <p>Hãy thêm sản phẩm mới từ trang admin</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Tạo card sản phẩm
function createProductCard(product) {
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
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[product.category]}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-actions">
                <button class="btn-add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                </button>
                <button class="btn-view" data-product-id="${product.id}">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
            </div>
        </div>
    `;
    
    // Thêm sự kiện cho nút thêm vào giỏ
    const addToCartBtn = card.querySelector('.btn-add-to-cart');
    addToCartBtn.addEventListener('click', function() {
        addToCart(product.id);
    });
    
    // Thêm sự kiện cho nút xem chi tiết
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    return card;
}

// Thêm sản phẩm vào giỏ hàng
function addToCart(productId) {
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
    
    // Hiển thị thông báo
    showNotification(`Đã thêm ${product.name} vào giỏ hàng!`, 'success');
}

// Xem chi tiết sản phẩm
function viewProductDetail(productId) {
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Sản phẩm không tồn tại!', 'error');
        return;
    }
    
    // Hiển thị modal chi tiết sản phẩm
    showProductDetailModal(product);
}

// Hiển thị modal chi tiết sản phẩm
function showProductDetailModal(product) {
    // Format giá tiền
    const formattedPrice = product.price.toLocaleString('vi-VN') + ' VNĐ';
    
    // Lấy tên danh mục
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón'
    };
    
    // Tạo modal HTML
    const modalHTML = `
        <div class="modal active" id="product-detail-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết sản phẩm</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body product-detail">
                    <div class="product-detail-image">
                        <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                    </div>
                    <div class="product-detail-info">
                        <span class="product-category">${categoryNames[product.category]}</span>
                        <h2>${product.name}</h2>
                        <div class="product-price">${formattedPrice}</div>
                        <div class="product-description">
                            <h4>Mô tả sản phẩm</h4>
                            <p>${product.description}</p>
                        </div>
                        <div class="product-stock">
                            <span class="stock-label">Tình trạng:</span>
                            <span class="stock-value ${product.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                                ${product.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-to-cart-detail" data-product-id="${product.id}" ${product.quantity === 0 ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                            </button>
                            <button class="btn-secondary close-modal">Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Thêm sự kiện cho nút đóng
    const closeButtons = document.querySelectorAll('#product-detail-modal .close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            document.getElementById('product-detail-modal').remove();
        });
    });
    
    // Thêm sự kiện cho nút thêm vào giỏ
    const addToCartBtn = document.querySelector('.btn-add-to-cart-detail');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            if (product.quantity === 0) {
                showNotification('Sản phẩm đã hết hàng!', 'error');
                return;
            }
            
            addToCart(product.id);
            document.getElementById('product-detail-modal').remove();
        });
    }
    
    // Đóng modal khi click ra ngoài
    document.getElementById('product-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

// Cập nhật số lượng giỏ hàng
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

// Hiển thị thông báo
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
    
    // Thêm CSS cho thông báo
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
                justify-content: space-between;
                gap: 15px;
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
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 10px;
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
            
            .notification-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: var(--gray-color);
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
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

// Khởi tạo hiệu ứng scroll mượt
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Chỉ xử lý các liên kết nội bộ
            if (href.startsWith('#') && href !== '#') {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Đóng menu mobile nếu đang mở
                    const navLinks = document.querySelector('.nav-links');
                    if (navLinks && navLinks.classList.contains('active')) {
                        navLinks.classList.remove('active');
                        const menuToggle = document.querySelector('.menu-toggle');
                        if (menuToggle) {
                            menuToggle.querySelector('i').classList.remove('fa-times');
                            menuToggle.querySelector('i').classList.add('fa-bars');
                        }
                    }
                    
                    // Scroll đến phần tử
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}