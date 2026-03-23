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
    const q = urlParams.get('q');
    if (q) {
        const nameInput = document.getElementById('search-name');
        if (nameInput) {
            nameInput.value = q;
            applyFilters();
        }
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
        applyFilters(true);
    } else {
        applyFilters(true);
    }
}

// Lấy sản phẩm mẫu và khởi tạo (copy logic từ main.js)
function getSampleProductsAndInitialize() {
    let products = [];
    if (typeof getDefaultProducts === 'function') {
        products = getDefaultProducts();
    }
    
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

    // Filter by gender
    const genderFilter = document.getElementById('filter-gender');
    if (genderFilter) {
        genderFilter.addEventListener('change', applyFilters);
    }
    
    // Price range filter
    document.getElementById('price-min').addEventListener('input', applyFilters);
    document.getElementById('price-max').addEventListener('input', applyFilters);
    
    // Reset filters
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

// Áp dụng các filter
const PRODUCTS_PAGE_SIZE = 15;
let productsCurrentPage = 1;
let productsLastFiltered = [];

function applyFilters(resetPage = true) {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Lấy giá trị từ các filter
    const searchName = document.getElementById('search-name').value.toLowerCase();
    const sortName = document.getElementById('sort-name').value;
    const sortPrice = document.getElementById('sort-price').value;
    const filterCategory = document.getElementById('filter-category').value;
    const filterGender = document.getElementById('filter-gender') ? document.getElementById('filter-gender').value : 'all';
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Infinity;
    
    // Lọc sản phẩm
    let filteredProducts = products.filter(product => {
        const productGender = (product.gender || 'unisex').toLowerCase();

        // Filter by name
        const matchName = product.name.toLowerCase().includes(searchName);

        // Filter by category
        const matchCategory = filterCategory === 'all' || product.category === filterCategory;

        // Filter by gender
        const matchGender = filterGender === 'all' ||
            (filterGender === 'male' && (productGender === 'male' || productGender === 'unisex')) ||
            (filterGender === 'female' && (productGender === 'female' || productGender === 'unisex'));

        // Filter by price
        const matchPrice = product.price >= priceMin && product.price <= priceMax;

        return matchName && matchCategory && matchGender && matchPrice;
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
    productsLastFiltered = filteredProducts;
    if (resetPage) productsCurrentPage = 1;
    displayProductsList(filteredProducts);
}

// Hiển thị danh sách sản phẩm
function displayProductsList(products) {
    const container = document.getElementById('products-container');
    const pagination = document.getElementById('products-pagination');
    const startEl = document.getElementById('showing-start');
    const endEl = document.getElementById('showing-end');
    const totalEl = document.getElementById('total-count');
    
    container.innerHTML = '';
    if (pagination) pagination.innerHTML = '';
    const total = products.length;
    if (totalEl) totalEl.textContent = total.toString();
    
    if (products.length === 0) {
        if (startEl) startEl.textContent = '0';
        if (endEl) endEl.textContent = '0';
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px;">
                <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray-color); margin-bottom: 20px; display: block;"></i>
                <h3 style="color: var(--gray-color);">Không tìm thấy sản phẩm</h3>
                <p style="color: var(--gray-color);">Hãy thử thay đổi các bộ lọc của bạn</p>
            </div>
        `;
        return;
    }

    const totalPages = Math.max(1, Math.ceil(total / PRODUCTS_PAGE_SIZE));
    if (productsCurrentPage > totalPages) productsCurrentPage = totalPages;

    const startIndex = (productsCurrentPage - 1) * PRODUCTS_PAGE_SIZE;
    const endIndex = Math.min(startIndex + PRODUCTS_PAGE_SIZE, total);
    if (startEl) startEl.textContent = (startIndex + 1).toString();
    if (endEl) endEl.textContent = endIndex.toString();
    
    products.slice(startIndex, endIndex).forEach(product => {
        const card = createProductCardForPage(product);
        container.appendChild(card);
    });

    renderPagination(totalPages);
}

function renderPagination(totalPages) {
    const pagination = document.getElementById('products-pagination');
    if (!pagination) return;
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const makeBtn = (label, page, disabled = false, active = false) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pagination-btn' + (active ? ' active' : '');
        btn.textContent = label;
        if (disabled) btn.disabled = true;
        btn.addEventListener('click', () => {
            if (page === productsCurrentPage) return;
            productsCurrentPage = page;
            displayProductsList(productsLastFiltered);
            const layoutTop = document.querySelector('.products-content');
            if (layoutTop) layoutTop.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return btn;
    };

    const prev = makeBtn('Prev', Math.max(1, productsCurrentPage - 1), productsCurrentPage === 1);
    pagination.appendChild(prev);

    const maxButtons = 5;
    let startPage = Math.max(1, productsCurrentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    startPage = Math.max(1, endPage - maxButtons + 1);

    if (startPage > 1) {
        pagination.appendChild(makeBtn('1', 1, false, productsCurrentPage === 1));
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '…';
            pagination.appendChild(dots);
        }
    }

    for (let p = startPage; p <= endPage; p++) {
        pagination.appendChild(makeBtn(String(p), p, false, productsCurrentPage === p));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '…';
            pagination.appendChild(dots);
        }
        pagination.appendChild(makeBtn(String(totalPages), totalPages, false, productsCurrentPage === totalPages));
    }

    const next = makeBtn('Next', Math.min(totalPages, productsCurrentPage + 1), productsCurrentPage === totalPages);
    pagination.appendChild(next);
}

// Tạo card sản phẩm cho trang sản phẩm
function createProductCardForPage(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.setAttribute('data-category', product.category);
    
    // Format giá tiền
    const formattedPrice = product.price.toLocaleString('vi-VN') + '₫';
    
    // Lấy tên danh mục
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón',
        'dolot': 'Đồ lót'
    };
    
    // Kiểm tra trạng thái đăng nhập
    const loggedIn = isUserLoggedIn();
    
    // Kiểm tra trạng thái hàng
    const isOutOfStock = product.status === 'out-of-stock' || product.quantity === 0;

    const mainImage = Array.isArray(product.images) && product.images.length ? product.images[0] : product.image;

    const badge = getProductBadge(product);
    const badgeHtml = badge ? `<div class="product-badge badge-${badge.type}">${badge.text}</div>` : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
            ${badgeHtml}
            ${isOutOfStock ? '<div class="out-of-stock-badge">Hết hàng</div>' : ''}
            <div class="product-quick-actions">
                ${loggedIn ? 
                    `<button class="btn-add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>` 
                    : 
                    `<button class="btn-login-required" type="button">
                        <i class="fas fa-lock"></i> Hãy đăng nhập
                    </button>`
                }
                <button class="btn-view" data-product-id="${product.id}">
                    <i class="fas fa-eye"></i> Xem nhanh
                </button>
            </div>
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[product.category]}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formattedPrice}</div>
        </div>
    `;
    
    // Thêm sự kiện cho nút thêm vào giỏ nếu đã đăng nhập và sản phẩm còn hàng
    if (loggedIn && !isOutOfStock) {
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', function() {
            addToCart(product.id);
        });
    } else if (!loggedIn) {
        const loginBtn = card.querySelector('.btn-login-required');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }
    
    // Thêm sự kiện cho nút xem chi tiết
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    // Thêm sự kiện cho hình ảnh sản phẩm
    const productImage = card.querySelector('.product-image');
    productImage.addEventListener('click', function(e) {
        if (e.target.closest('.product-quick-actions')) return;
        viewProductDetail(product.id);
    });
    
    // Thêm sự kiện cho tên sản phẩm
    const productName = card.querySelector('.product-name');
    productName.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    return card;
}

function getProductBadge(product) {
    const createdAt = product && product.createdAt ? new Date(product.createdAt) : null;
    const now = new Date();
    if (createdAt && !isNaN(createdAt.getTime())) {
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / 86400000);
        if (diffDays <= 14) return { text: 'NEW', type: 'new' };
    }
    if (typeof product.quantity === 'number' && product.quantity <= 10 && product.quantity > 0) {
        return { text: 'HOT', type: 'hot' };
    }
    if (typeof product.price === 'number' && product.price <= 300000) {
        return { text: 'SALE', type: 'sale' };
    }
    return null;
}

// Hiển thị sản phẩm ban đầu
function displayProductsWithFilters(products) {
    productsLastFiltered = products || [];
    productsCurrentPage = 1;
    displayProductsList(productsLastFiltered);
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

    if (typeof window.logAnalyticsEvent === 'function') {
        window.logAnalyticsEvent('add_to_cart', String(productId));
    }
    
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
