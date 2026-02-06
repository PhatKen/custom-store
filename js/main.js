// Khởi tạo dữ liệu mẫu nếu chưa có
function initializeSampleData() {
    // Khởi tạo người dùng mẫu
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
        users = [
            {
                id: 1,
                fullName: 'Admin Custom Store',
                email: 'admin@customstore.com',
                phone: '0123456789',
                role: 'admin',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                fullName: 'Nguyễn Văn A',
                email: 'user@example.com',
                phone: '0987654321',
                role: 'user',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                fullName: 'Trần Thị B',
                email: 'tranthi.b@example.com',
                phone: '0912345678',
                role: 'user',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                fullName: 'Lê Văn C',
                email: 'levan.c@example.com',
                phone: '0934567890',
                role: 'user',
                status: 'inactive',
                createdAt: new Date().toISOString()
            }
        ];
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Đã khởi tạo dữ liệu người dùng mẫu');
    }
    
    // Khởi tạo sản phẩm mẫu nếu chưa có
    let products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) {
        products = getSampleProducts();
        localStorage.setItem('products', JSON.stringify(products));
        console.log('Đã khởi tạo dữ liệu sản phẩm mẫu');
    }
    
    // Khởi tạo đơn hàng mẫu nếu chưa có
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    if (orders.length === 0) {
        orders = [
            {
                id: 1001,
                customerName: 'Nguyễn Văn A',
                customerPhone: '0987654321',
                customerEmail: 'user@example.com',
                customerAddress: '123 Đường ABC, Quận XYZ, TP.HCM',
                paymentMethod: 'cod',
                items: [
                    {
                        id: 1,
                        name: 'Áo thun basic nam nữ',
                        category: 'ao',
                        price: 199000,
                        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                        quantity: 2
                    },
                    {
                        id: 4,
                        name: 'Nón lưỡi trai thời trang',
                        category: 'non',
                        price: 150000,
                        image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                        quantity: 1
                    }
                ],
                subtotal: 548000,
                shippingFee: 30000,
                discount: 0,
                total: 578000,
                status: 'completed',
                createdAt: new Date('2023-11-15').toISOString()
            },
            {
                id: 1002,
                customerName: 'Trần Thị B',
                customerPhone: '0912345678',
                customerEmail: 'tranthi.b@example.com',
                customerAddress: '456 Đường DEF, Quận GHI, TP.HCM',
                paymentMethod: 'banking',
                items: [
                    {
                        id: 3,
                        name: 'Giày thể thao Nike',
                        category: 'giay',
                        price: 1200000,
                        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
                        quantity: 1
                    }
                ],
                subtotal: 1200000,
                shippingFee: 30000,
                discount: 0,
                total: 1230000,
                status: 'pending',
                createdAt: new Date('2023-11-20').toISOString()
            }
        ];
        
        localStorage.setItem('orders', JSON.stringify(orders));
        console.log('Đã khởi tạo dữ liệu đơn hàng mẫu');
    }
}

// Gọi hàm khởi tạo dữ liệu
initializeSampleData();

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
    
    // Cập nhật header theo trạng thái đăng nhập
    updateUserHeader();
    
    // Cập nhật lại các nút thêm vào giỏ
    updateProductButtons();

    initHomeNews();
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

function initHeaderSearch() {
    const input = document.getElementById('header-search-input');
    const btn = document.getElementById('header-search-btn');
    if (!input || !btn) return;
    btn.addEventListener('click', function() {
        const q = input.value.trim();
        window.location.href = q ? `products.html?q=${encodeURIComponent(q)}` : 'products.html';
    });
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const q = input.value.trim();
            window.location.href = q ? `products.html?q=${encodeURIComponent(q)}` : 'products.html';
        }
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

function getSampleNews() {
    return [
        {
            id: 1,
            category: 'Áo',
            date: '04 Tháng 2, 2026',
            title: '5 Kiểu Áo Phông Trendy Năm 2026',
            image: 'https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?w=800&h=500&fit=crop',
            excerpt: 'Khám phá những kiểu áo phông đang thịnh hành nhất năm nay từ oversized thoải mái đến cổ điển với chi tiết độc đáo.'
        },
        {
            id: 2,
            category: 'Quần',
            date: '02 Tháng 2, 2026',
            title: 'Quần Jeans Slimfit - Lựa Chọn Hoàn Hảo',
            image: 'https://images.pexels.com/photos/2220294/pexels-photo-2220294.jpeg?w=800&h=500&fit=crop',
            excerpt: 'Slimfit tôn dáng, hiện đại và lịch sự. Cách chọn size, phối đồ thông minh và bảo quản để bền đẹp.'
        },
        {
            id: 3,
            category: 'Giày',
            date: '31 Tháng 1, 2026',
            title: 'Giày Thể Thao Nike - Thoải Mái Và Phong Cách',
            image: 'https://images.pexels.com/photos/3622622/pexels-photo-3622622.jpeg?w=800&h=500&fit=crop',
            excerpt: 'Công nghệ đệm tốt, thiết kế hiện đại. Từ mẫu cổ điển đến phiên bản mới, phù hợp cả phong cách và hiệu năng.'
        },
        {
            id: 4,
            category: 'Nón',
            date: '29 Tháng 1, 2026',
            title: 'Nón Snapback - Phụ Kiện Hoàn Hảo',
            image: 'https://images.pexels.com/photos/3622627/pexels-photo-3622627.jpeg?w=800&h=500&fit=crop',
            excerpt: 'Đa dạng màu sắc và thiết kế, dễ phối với nhiều trang phục. Mẹo chọn nón hợp với khuôn mặt.'
        }
    ];
}

let homeNewsIndex = 0;
let homeNewsTimer = null;
let homeNewsData = [];

function initHomeNews() {
    const container = document.getElementById('home-news-item');
    if (!container) return;
    homeNewsData = getSampleNews();
    renderHomeNewsItem(container, homeNewsData[homeNewsIndex]);
    if (homeNewsTimer) {
        clearInterval(homeNewsTimer);
    }
    scheduleHomeNewsRotation();
    const prevBtn = document.getElementById('home-news-prev');
    const nextBtn = document.getElementById('home-news-next');
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            updateHomeNewsIndex(-1);
            scheduleHomeNewsRotation();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            updateHomeNewsIndex(1);
            scheduleHomeNewsRotation();
        });
    }
}

function renderHomeNewsItem(container, item) {
    container.innerHTML = `
        <div class="home-news-content">
            <img class="home-news-image" src="${item.image}" alt="${item.title}" onerror="this.src='https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
            <div class="home-news-info">
                <span class="news-badge">${item.category}</span>
                <h3 class="home-news-title">${item.title}</h3>
                <div class="home-news-date"><i class="fas fa-calendar"></i> ${item.date}</div>
                <p class="home-news-excerpt">${item.excerpt}</p>
                <div class="home-news-actions">
                    <a href="news.html" class="home-news-readmore">Đọc thêm <i class="fas fa-arrow-right"></i></a>
                </div>
            </div>
        </div>
    `;
}

function updateHomeNewsIndex(delta) {
    const container = document.getElementById('home-news-item');
    if (!container || homeNewsData.length === 0) return;
    const len = homeNewsData.length;
    homeNewsIndex = (homeNewsIndex + delta + len) % len;
    renderHomeNewsItem(container, homeNewsData[homeNewsIndex]);
}

function scheduleHomeNewsRotation() {
    if (homeNewsTimer) {
        clearInterval(homeNewsTimer);
    }
    homeNewsTimer = setInterval(() => {
        updateHomeNewsIndex(1);
    }, 10000);
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
    
    // Sắp xếp theo số bán giảm dần và lấy 6 sản phẩm bán chạy nhất
    const topSellingProducts = products
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 6);
    
    // Hiển thị sản phẩm
    displayProducts(topSellingProducts);
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
            sold: 152,
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
            sold: 98,
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
            sold: 45,
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
            sold: 189,
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
            sold: 67,
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
            sold: 134,
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
            sold: 76,
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
            sold: 53,
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
// Kiểm tra người dùng đã đăng nhập hay chưa
function isUserLoggedIn() {
    return JSON.parse(localStorage.getItem('currentUser')) !== null;
}

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
    
    // Thêm sự kiện cho hình ảnh sản phẩm
    const productImage = card.querySelector('.product-image');
    productImage.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    // Thêm sự kiện cho tên sản phẩm
    const productName = card.querySelector('.product-name');
    productName.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    return card;
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
    
    // Kiểm tra trạng thái hàng
    const isOutOfStock = product.status === 'out-of-stock' || product.quantity === 0;
    
    // Số lượng hiển thị (hiển thị 0 khi hết hàng)
    const displayQuantity = isOutOfStock ? 0 : product.quantity;
    
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
                        ${isOutOfStock ? '<div class="out-of-stock-badge">Hết hàng</div>' : ''}
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
                            <span class="stock-value ${isOutOfStock ? 'out-of-stock' : 'in-stock'}">
                                ${isOutOfStock ? 'Hết hàng' : 'Còn hàng'}
                            </span>
                        </div>
                        <div class="product-stock">
                            <span class="stock-label">Số lượng còn lại:</span>
                            <span class="stock-quantity">${displayQuantity}</span>
                        </div>
                        <div class="product-actions">
                            <button class="btn-add-to-cart-detail btn-add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-shopping-cart"></i> ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                            </button>
                            <button class="btn-buy-now" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                                <i class="fas fa-credit-card"></i> ${isOutOfStock ? 'Hết hàng' : 'Mua ngay'}
                            </button>
                        </div>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="recommended-products">
                        <h3>Có thể bạn quan tâm</h3>
                        <div class="recommended-grid" id="product-recommended-products"></div>
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
            // Kiểm tra đăng nhập
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                showNotification('Vui lòng đăng nhập để tiếp tục!', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                return;
            }
            
            if (product.quantity === 0) {
                showNotification('Sản phẩm đã hết hàng!', 'error');
                return;
            }
            
            addToCart(product.id);
            document.getElementById('product-detail-modal').remove();
        });
    }
    
    // Thêm sự kiện cho nút mua ngay
    const buyNowBtn = document.querySelector('.btn-buy-now');
    if (buyNowBtn) {
        buyNowBtn.addEventListener('click', function() {
            // Kiểm tra đăng nhập
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                showNotification('Vui lòng đăng nhập để tiếp tục!', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 1000);
                return;
            }
            
            if (product.quantity === 0) {
                showNotification('Sản phẩm đã hết hàng!', 'error');
                return;
            }
            
            // Thêm sản phẩm vào giỏ hàng
            addToCart(product.id);
            
            // Đóng modal và chuyển hướng đến trang checkout
            document.getElementById('product-detail-modal').remove();
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 300);
        });
    }
    
    // Đóng modal khi click ra ngoài
    document.getElementById('product-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });

    const recoContainer = document.getElementById('product-recommended-products');
    if (recoContainer) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        const sameCategory = products.filter(p => p.category === product.category && p.id !== product.id);
        const sortedSame = sameCategory.sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 4);
        let recommendations = sortedSame;
        if (recommendations.length < 4) {
            const others = products.filter(p => p.category !== product.category && p.id !== product.id);
            const fill = others.sort(() => 0.5 - Math.random()).slice(0, 4 - recommendations.length);
            recommendations = recommendations.concat(fill);
        }
        recoContainer.innerHTML = '';
        recommendations.forEach(reco => {
            const card = createRecommendedCardForModal(reco, product.id);
            recoContainer.appendChild(card);
        });
    }
}

function createRecommendedCardForModal(recoProduct, currentProductId) {
    const card = document.createElement('div');
    card.className = 'product-card';
    const formattedPrice = recoProduct.price.toLocaleString('vi-VN') + ' VNĐ';
    const categoryNames = { 'ao': 'Áo', 'quan': 'Quần', 'giay': 'Giày', 'non': 'Nón' };
    const loggedIn = JSON.parse(localStorage.getItem('currentUser')) !== null;
    card.innerHTML = `
        <div class="product-image">
            <img src="${recoProduct.image}" alt="${recoProduct.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[recoProduct.category]}</span>
            <h3 class="product-name">${recoProduct.name}</h3>
            <div class="product-price">${formattedPrice}</div>
            <div class="product-actions">
                ${loggedIn ? 
                    `<button class="btn-add-to-cart" data-product-id="${recoProduct.id}">
                        <i class="fas fa-shopping-cart"></i> Thêm vào giỏ
                    </button>` 
                    : 
                    `<div class="btn-login-required">
                        <i class="fas fa-lock"></i> Hãy đăng nhập
                    </div>`
                }
                <button class="btn-view" data-product-id="${recoProduct.id}">
                    <i class="fas fa-eye"></i> Xem chi tiết
                </button>
            </div>
        </div>
    `;
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        const existing = document.getElementById('product-detail-modal');
        if (existing) existing.remove();
        viewProductDetail(recoProduct.id);
    });
    const img = card.querySelector('.product-image');
    img.addEventListener('click', function() {
        const existing = document.getElementById('product-detail-modal');
        if (existing) existing.remove();
        viewProductDetail(recoProduct.id);
    });
    const nameEl = card.querySelector('.product-name');
    nameEl.addEventListener('click', function() {
        const existing = document.getElementById('product-detail-modal');
        if (existing) existing.remove();
        viewProductDetail(recoProduct.id);
    });
    if (loggedIn) {
        const addBtn = card.querySelector('.btn-add-to-cart');
        addBtn.addEventListener('click', function() {
            addToCart(recoProduct.id);
        });
    }
    return card;
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

// Hàm cập nhật header theo trạng thái đăng nhập
function updateUserHeader() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const navActions = document.getElementById('nav-actions');
    
    if (!navActions) return;
    
    if (currentUser) {
        // Người dùng đã đăng nhập
        const userName = currentUser.fullName || currentUser.email.split('@')[0];
        navActions.innerHTML = `
            <div class="header-search">
                <input type="text" id="header-search-input" placeholder="Tìm kiếm sản phẩm...">
                <button id="header-search-btn"><i class="fas fa-search"></i></button>
            </div>
            <div class="user-menu">
                <button class="user-btn" id="user-menu-btn">
                    <i class="fas fa-user"></i>
                    <span>${userName}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="account.html" class="dropdown-item" id="edit-profile-btn">
                        <i class="fas fa-user-edit"></i> Chỉnh sửa tài khoản
                    </a>
                    ${currentUser.role === 'admin' ? 
                        `<a href="admin.html" class="dropdown-item">
                            <i class="fas fa-cog"></i> Quản lý admin
                        </a>` : ''}
                    <a href="#" class="dropdown-item" id="logout-btn">
                        <i class="fas fa-sign-out-alt"></i> Đăng xuất
                    </a>
                </div>
            </div>
            <div class="menu-toggle">
                <i class="fas fa-bars"></i>
            </div>
        `;
        
        // Thêm sự kiện cho menu người dùng
        const userMenuBtn = document.getElementById('user-menu-btn');
        const userDropdown = document.getElementById('user-dropdown');
        
        if (userMenuBtn && userDropdown) {
            userMenuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                userDropdown.classList.toggle('show');
            });
            
            // Đóng dropdown khi click ra ngoài
            document.addEventListener('click', function() {
                userDropdown.classList.remove('show');
            });
        }
        
        // Thêm sự kiện đăng xuất
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                localStorage.removeItem('currentUser');
                updateUserHeader();
                updateCartCount();
                // Cập nhật lại các nút thêm vào giỏ
                updateProductButtons();
                showNotification('Đã đăng xuất thành công!', 'success');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            });
        }
        
        // Khởi tạo lại menu mobile
        initMobileMenu();
    } else {
        // Người dùng chưa đăng nhập
        navActions.innerHTML = `
            <div class="header-search">
                <input type="text" id="header-search-input" placeholder="Tìm kiếm sản phẩm...">
                <button id="header-search-btn"><i class="fas fa-search"></i></button>
            </div>
            <a href="register.html" class="btn-register">Đăng ký</a>
            <a href="login.html" class="btn-login">Đăng nhập</a>
            <div class="menu-toggle">
                <i class="fas fa-bars"></i>
            </div>
        `;
        
        // Khởi tạo lại menu mobile
        initMobileMenu();
    }
    initHeaderSearch();
}

// Cập nhật lại các nút thêm vào giỏ trong các thẻ sản phẩm
function updateProductButtons() {
    const productCards = document.querySelectorAll('.product-card');
    const loggedIn = isUserLoggedIn();
    
    productCards.forEach(card => {
        const productActions = card.querySelector('.product-actions');
        if (!productActions) return;
        
        // Lấy ID sản phẩm
        const viewBtn = card.querySelector('.btn-view');
        const productId = viewBtn?.getAttribute('data-product-id');
        
        if (!productId) return;
        
        // Tìm phần tử nút thêm vào giỏ hoặc text "Hãy đăng nhập"
        const existingButton = productActions.querySelector('.btn-add-to-cart, .btn-login-required');
        
        if (!existingButton) return;
        
        if (loggedIn) {
            // Nếu đã đăng nhập, tạo nút "Thêm vào giỏ"
            if (existingButton.classList.contains('btn-login-required')) {
                const newButton = document.createElement('button');
                newButton.className = 'btn-add-to-cart';
                newButton.setAttribute('data-product-id', productId);
                newButton.innerHTML = '<i class="fas fa-shopping-cart"></i> Thêm vào giỏ';
                newButton.addEventListener('click', function() {
                    addToCart(productId);
                });
                existingButton.replaceWith(newButton);
            }
        } else {
            // Nếu chưa đăng nhập, tạo div "Hãy đăng nhập"
            if (existingButton.classList.contains('btn-add-to-cart')) {
                const newDiv = document.createElement('div');
                newDiv.className = 'btn-login-required';
                newDiv.setAttribute('data-product-id', productId);
                newDiv.innerHTML = '<i class="fas fa-lock"></i> Hãy đăng nhập';
                existingButton.replaceWith(newDiv);
            }
        }
    });
}
