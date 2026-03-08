// Khởi tạo trang admin
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo navigation
    initAdminNavigation();
    
    applyRoleRestrictions();
    
    // Khởi tạo tải dữ liệu dashboard
    loadDashboardData();
    
    // Khởi tải sản phẩm
    loadProductsForAdmin();
    
    // Khởi tạo form thêm sản phẩm
    initAddProductForm();
    
    // Khởi tải đơn hàng
    loadOrders();
    
    // Khởi tải người dùng
    loadUsers();
    initUserTableEvents();
    
    // Khởi tải lịch sử mua hàng
    loadPurchaseHistory();

    // Khởi tải bài viết
    loadPosts();
    initPostEvents();
    
    // Khởi tạo chức năng đăng xuất
    initLogout();
    
    // Khởi tạo tìm kiếm và lọc
    initSearchAndFilter();
});

function applyRoleRestrictions() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return;
    const role = currentUser.role;
    const menuItem = sel => document.querySelector(`.admin-menu a[data-section="${sel}"]`)?.closest('li');
    const hideSection = id => {
        const sec = document.getElementById(id);
        if (sec) sec.classList.remove('active');
    };
    if (role === 'staff_products') {
        menuItem('add-product') && (menuItem('add-product').style.display = 'none');
        menuItem('orders') && (menuItem('orders').style.display = 'none');
        menuItem('users') && (menuItem('users').style.display = 'none');
        hideSection('add-product');
        hideSection('orders');
        hideSection('users');
        const prodLink = document.querySelector('.admin-menu a[data-section="products-management"]');
        if (prodLink) prodLink.click();
        document.addEventListener('click', function(e) {
            if (e.target.closest('.products-table .btn-edit') || e.target.closest('.products-table .btn-delete')) {
                e.preventDefault();
            }
        });
    } else if (role === 'staff_orders') {
        menuItem('products-management') && (menuItem('products-management').style.display = 'none');
        menuItem('add-product') && (menuItem('add-product').style.display = 'none');
        menuItem('users') && (menuItem('users').style.display = 'none');
        hideSection('products-management');
        hideSection('add-product');
        hideSection('users');
        const ordersLink = document.querySelector('.admin-menu a[data-section="orders"]');
        if (ordersLink) ordersLink.click();
        document.addEventListener('click', function(e) {
            if (e.target.closest('.btn-delete-order')) {
                e.preventDefault();
            }
        });
    }
}

// Khởi tạo navigation admin
function initAdminNavigation() {
    const menuLinks = document.querySelectorAll('.admin-menu a');
    const sections = document.querySelectorAll('.admin-section');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Xóa active class khỏi tất cả các liên kết
            menuLinks.forEach(item => item.classList.remove('active'));
            
            // Thêm active class cho liên kết được nhấn
            this.classList.add('active');
            
            // Ẩn tất cả các section
            sections.forEach(section => section.classList.remove('active'));
            
            // Hiển thị section được chọn
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });
}

// Tải dữ liệu dashboard
function loadDashboardData() {
    // Lấy dữ liệu từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Cập nhật thống kê
    document.getElementById('total-products').textContent = products.length;
    document.getElementById('total-orders').textContent = orders.length;
    document.getElementById('total-users').textContent = users.length;
    
    // Tính tổng doanh thu
    const totalRevenue = orders.reduce((total, order) => total + order.total, 0);
    document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('vi-VN') + ' VNĐ';
    
    updateUserRoleStats(users);
    initRevenueDashboard(products, orders);
    
    // Tải hoạt động gần đây
    loadRecentActivity(products, orders, users);
}

function updateUserRoleStats(users) {
    const counts = {
        total: users.length,
        admin: 0,
        staffProducts: 0,
        staffOrders: 0,
        customer: 0
    };
    users.forEach(user => {
        if (user.role === 'admin') counts.admin++;
        else if (user.role === 'staff_products') counts.staffProducts++;
        else if (user.role === 'staff_orders') counts.staffOrders++;
        else counts.customer++;
    });
    const totalEl = document.getElementById('stat-users-total');
    const adminEl = document.getElementById('stat-users-admin');
    const staffProductsEl = document.getElementById('stat-users-staff-products');
    const staffOrdersEl = document.getElementById('stat-users-staff-orders');
    const customerEl = document.getElementById('stat-users-customers');
    if (totalEl) totalEl.textContent = counts.total;
    if (adminEl) adminEl.textContent = counts.admin;
    if (staffProductsEl) staffProductsEl.textContent = counts.staffProducts;
    if (staffOrdersEl) staffOrdersEl.textContent = counts.staffOrders;
    if (customerEl) customerEl.textContent = counts.customer;
}

let currentRevenuePeriod = 'month';

function initRevenueDashboard(products, orders) {
    const filtersContainer = document.getElementById('revenue-period-filters');
    if (!filtersContainer) return;
    
    filtersContainer.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', () => {
            const period = btn.getAttribute('data-period');
            if (!period) return;
            currentRevenuePeriod = period;
            filtersContainer.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateRevenueOverview(products, orders, period);
        });
    });
    
    updateRevenueOverview(products, orders, currentRevenuePeriod);
}

function getPeriodRange(period) {
    const now = new Date();
    let start = null;
    if (period === 'day') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
        const day = now.getDay() || 7;
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day + 1);
    } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
    }
    return { start, end: now };
}

function updateRevenueOverview(products, orders, period) {
    const range = getPeriodRange(period);
    const categoryNames = {
        'ao': 'Áo',
        'quan': 'Quần',
        'giay': 'Giày',
        'non': 'Nón'
    };
    const categories = Object.keys(categoryNames);
    
    const stats = {};
    categories.forEach(cat => {
        const catProducts = products.filter(p => p.category === cat);
        stats[cat] = {
            key: cat,
            name: categoryNames[cat],
            totalProducts: catProducts.length,
            remainingQty: catProducts.reduce((sum, p) => sum + (parseInt(p.quantity) || 0), 0),
            soldQty: 0,
            revenue: 0,
            orderCount: 0
        };
    });
    
    let filteredOrders = orders.filter(order => order && order.createdAt);
    filteredOrders = filteredOrders.filter(order => order.status !== 'cancelled');
    if (range.start) {
        filteredOrders = filteredOrders.filter(order => {
            const d = new Date(order.createdAt);
            return d >= range.start && d <= range.end;
        });
    }
    
    let totalQuantity = 0;
    let totalRevenue = 0;
    
    filteredOrders.forEach(order => {
        const items = order.items || [];
        const categoriesInOrder = new Set();
        items.forEach(item => {
            const cat = item.category;
            if (!stats[cat]) return;
            const qty = parseInt(item.quantity) || 0;
            const lineTotal = (item.price || 0) * qty;
            stats[cat].soldQty += qty;
            stats[cat].revenue += lineTotal;
            totalQuantity += qty;
            totalRevenue += lineTotal;
            categoriesInOrder.add(cat);
        });
        categoriesInOrder.forEach(cat => {
            stats[cat].orderCount += 1;
        });
    });
    
    const tbody = document.getElementById('revenue-by-category-body');
    if (tbody) {
        tbody.innerHTML = '';
        let hasRow = false;
        categories.forEach(cat => {
            const s = stats[cat];
            if (!s) return;
            const avgPrice = s.soldQty > 0 ? Math.round(s.revenue / s.soldQty) : 0;
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${s.name}</td>
                <td>${s.totalProducts}</td>
                <td>${s.remainingQty}</td>
                <td>${s.soldQty}</td>
                <td>${s.orderCount}</td>
                <td>${s.revenue.toLocaleString('vi-VN')} VNĐ</td>
                <td>${avgPrice.toLocaleString('vi-VN')} VNĐ</td>
            `;
            tbody.appendChild(row);
            hasRow = true;
        });
        if (!hasRow) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="7" style="text-align:center; padding:16px 0; color: var(--gray-color);">
                    Chưa có dữ liệu đơn hàng cho khoảng thời gian này
                </td>
            `;
            tbody.appendChild(row);
        }
    }
    
    const totalOrdersEl = document.getElementById('revenue-total-orders');
    const totalQtyEl = document.getElementById('revenue-total-quantity');
    const totalAmountEl = document.getElementById('revenue-total-amount');
    if (totalOrdersEl) totalOrdersEl.textContent = filteredOrders.length;
    if (totalQtyEl) totalQtyEl.textContent = totalQuantity;
    if (totalAmountEl) totalAmountEl.textContent = totalRevenue.toLocaleString('vi-VN') + ' VNĐ';
    
    const labelEl = document.getElementById('revenue-period-label');
    if (labelEl) {
        let text = 'Tất cả thời gian';
        if (period === 'day') text = 'Hôm nay';
        else if (period === 'week') text = 'Tuần này';
        else if (period === 'month') text = 'Tháng này';
        else if (period === 'year') text = 'Năm nay';
        labelEl.textContent = `Khoảng thời gian: ${text} (đơn hàng không bị hủy)`;
    }
}

// Tải hoạt động gần đây
function loadRecentActivity(products, orders, users) {
    const activityList = document.getElementById('activity-list');
    
    if (!activityList) return;
    
    // Tạo danh sách hoạt động từ tất cả dữ liệu
    let activities = [];
    
    // Thêm hoạt động từ sản phẩm
    products.slice(-5).forEach(product => {
        activities.push({
            type: 'product-added',
            title: 'Sản phẩm mới được thêm',
            description: `"${product.name}" đã được thêm vào cửa hàng`,
            time: formatTimeAgo(new Date(product.createdAt || Date.now())),
            ts: new Date(product.createdAt || Date.now()).getTime()
        });
    });
    
    // Thêm hoạt động từ đơn hàng
    orders.slice(-5).forEach(order => {
        const customerName = order.customerName || (order.deliveryInfo && order.deliveryInfo.fullname) || 'Khách hàng';
        activities.push({
            type: 'order-placed',
            title: 'Đơn hàng mới',
            description: `Đơn hàng #${order.id} từ ${customerName}`,
            time: formatTimeAgo(new Date(order.createdAt || Date.now())),
            ts: new Date(order.createdAt || Date.now()).getTime()
        });
    });
    
    // Thêm hoạt động từ người dùng
    users.slice(-5).forEach(user => {
        activities.push({
            type: 'user-registered',
            title: 'Người dùng mới',
            description: `${user.fullName} đã đăng ký tài khoản`,
            time: formatTimeAgo(new Date(user.createdAt || Date.now())),
            ts: new Date(user.createdAt || Date.now()).getTime()
        });
    });
    
    // Sắp xếp theo thời gian (mới nhất trước)
    activities.sort((a, b) => (b.ts || 0) - (a.ts || 0));
    
    // Giới hạn số lượng hoạt động
    activities = activities.slice(0, 10);
    
    // Hiển thị hoạt động
    activityList.innerHTML = '';
    
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="no-activity">Không có hoạt động nào gần đây</p>';
        return;
    }
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Xác định icon dựa trên loại hoạt động
        let iconClass = '';
        switch (activity.type) {
            case 'product-added':
                iconClass = 'fas fa-box';
                break;
            case 'order-placed':
                iconClass = 'fas fa-shopping-cart';
                break;
            case 'user-registered':
                iconClass = 'fas fa-user-plus';
                break;
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon ${activity.type}">
                <i class="${iconClass}"></i>
            </div>
            <div class="activity-details">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
            </div>
            <div class="activity-time">${activity.time}</div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Định dạng thời gian cách đây
function formatTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
        return 'Vừa xong';
    } else if (diffMins < 60) {
        return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
        return `${diffHours} giờ trước`;
    } else {
        return `${diffDays} ngày trước`;
    }
}

// Tải sản phẩm cho trang quản lý
function loadProductsForAdmin() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    displayProductsTable(products);
}

// Hiển thị bảng sản phẩm
function displayProductsTable(products) {
    const tbody = document.getElementById('products-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">Không có sản phẩm nào</td>
            </tr>
        `;
        return;
    }
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Format giá tiền
        const formattedPrice = product.price.toLocaleString('vi-VN') + ' VNĐ';
        
        // Xác định tên danh mục
        const categoryNames = {
            'ao': 'Áo',
            'quan': 'Quần',
            'giay': 'Giày',
            'non': 'Nón'
        };
        
        // Xác định trạng thái dựa trên trường status hoặc số lượng
        const status = product.status || (product.quantity > 0 ? 'in-stock' : 'out-of-stock');
        const statusText = status === 'out-of-stock' ? 'Hết hàng' : 'Còn hàng';
        
        // Số lượng hiển thị (hiển thị 0 khi hết hàng)
        const displayQuantity = status === 'out-of-stock' ? 0 : product.quantity;
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td class="product-image-cell">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
            </td>
            <td>${product.name}</td>
            <td>
                <span class="category-badge category-${product.category}">
                    ${categoryNames[product.category]}
                </span>
            </td>
            <td>${formattedPrice}</td>
            <td>${displayQuantity}</td>
            <td>
                <span class="status-badge status-${status}">${statusText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Thêm sự kiện cho các nút
    addProductTableEvents();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'staff_products') {
        document.querySelectorAll('.products-table .btn-edit, .products-table .btn-delete').forEach(btn => {
            btn.setAttribute('disabled', 'true');
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}

// Thêm sự kiện cho bảng sản phẩm
function addProductTableEvents() {
    // Sự kiện chỉnh sửa
    document.querySelectorAll('.btn-edit').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            editProduct(productId);
        });
    });
    
    // Sự kiện xóa
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            deleteProduct(productId);
        });
    });
}

// Chỉnh sửa sản phẩm
function editProduct(productId) {
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Sản phẩm không tồn tại!', 'error');
        return;
    }
    
    // Điền thông tin vào form chỉnh sửa
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-quantity').value = product.quantity;
    document.getElementById('edit-product-description').value = product.description;
    
    // Thiết lập trạng thái sản phẩm dựa trên số lượng hoặc trạng thái được lưu
    const productStatus = product.status || (product.quantity > 0 ? 'in-stock' : 'out-of-stock');
    document.getElementById('edit-product-status').value = productStatus;
    
    const sizeContainer = document.getElementById('edit-product-sizes');
    if (sizeContainer) {
        const checkedSizes = Array.isArray(product.sizes) ? product.sizes : ['S','M','L','XL','XXL'];
        sizeContainer.querySelectorAll('input[type="checkbox"]').forEach(input => {
            input.checked = checkedSizes.includes(input.value);
        });
    }
    
    // Hiển thị modal
    const modal = document.getElementById('edit-product-modal');
    modal.style.display = 'flex';
    
    // Thêm sự kiện đóng modal
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    // Đóng modal khi click ra ngoài
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            modal.style.display = 'none';
        }
    });
    
    // Xử lý form chỉnh sửa
    const editForm = document.getElementById('edit-product-form');
    editForm.onsubmit = function(e) {
        e.preventDefault();
        
        // Cập nhật sản phẩm
        const sizeContainer = document.getElementById('edit-product-sizes');
        let sizes = [];
        if (sizeContainer) {
            sizes = Array.from(sizeContainer.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        }
        const updatedProduct = {
            id: parseInt(document.getElementById('edit-product-id').value),
            name: document.getElementById('edit-product-name').value,
            category: document.getElementById('edit-product-category').value,
            price: parseInt(document.getElementById('edit-product-price').value),
            quantity: parseInt(document.getElementById('edit-product-quantity').value),
            description: document.getElementById('edit-product-description').value,
            status: document.getElementById('edit-product-status').value,
            image: product.image,
            createdAt: product.createdAt,
            sizes: sizes.length ? sizes : undefined
        };
        
        // Cập nhật trong mảng sản phẩm
        const productIndex = products.findIndex(p => p.id == updatedProduct.id);
        if (productIndex !== -1) {
            products[productIndex] = updatedProduct;
            
            // Lưu vào localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
            // Phát sự kiện tùy chỉnh để thông báo cho các trang khác
            window.dispatchEvent(new Event('productsUpdated'));
            
            // Cập nhật bảng
            displayProductsTable(products);
            
            // Cập nhật dashboard
            loadDashboardData();
            
            // Đóng modal
            modal.style.display = 'none';
            
            // Hiển thị thông báo
            showNotification('Cập nhật sản phẩm thành công!', 'success');
        }
    };
}

// Xóa sản phẩm
function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
        return;
    }
    
    // Lấy sản phẩm từ localStorage
    let products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Lọc ra sản phẩm cần xóa
    products = products.filter(p => p.id != productId);
    
    // Lưu vào localStorage
    localStorage.setItem('products', JSON.stringify(products));
    
    // Phát sự kiện tùy chỉnh để thông báo cho các trang khác
    window.dispatchEvent(new Event('productsUpdated'));
    
    // Cập nhật bảng
    displayProductsTable(products);
    
    // Cập nhật dashboard
    loadDashboardData();
    
    // Hiển thị thông báo
    showNotification('Xóa sản phẩm thành công!', 'success');
}

// Khởi tạo form thêm sản phẩm
function initAddProductForm() {
    const form = document.getElementById('add-product-form');
    const uploadBtn = document.getElementById('upload-btn');
    const imageInput = document.getElementById('product-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (!form) return;
    
    // Xử lý upload hình ảnh
    uploadBtn.addEventListener('click', function() {
        imageInput.click();
    });
    
    imageInput.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Hiển thị hình ảnh xem trước
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.classList.add('has-image');
            };
            
            reader.readAsDataURL(this.files[0]);
        }
    });
    
    // Kéo thả hình ảnh
    imagePreview.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--primary-color)';
    });
    
    imagePreview.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
    });
    
    imagePreview.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        
        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                imagePreview.classList.add('has-image');
            };
            reader.readAsDataURL(e.dataTransfer.files[0]);
        }
    });
    
    // Xử lý submit form
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy dữ liệu từ form
        const productName = document.getElementById('product-name').value;
        const productCategory = document.getElementById('product-category').value;
        const productPrice = parseInt(document.getElementById('product-price').value);
        const productQuantity = parseInt(document.getElementById('product-quantity').value);
        const productDescription = document.getElementById('product-description').value;
        const productImage = imageInput.files[0];
        const sizeContainer = document.getElementById('product-sizes');
        let sizes = [];
        if (sizeContainer) {
            sizes = Array.from(sizeContainer.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        }
        
        // Kiểm tra dữ liệu
        if (!productName || !productCategory || !productPrice || !productQuantity || !productDescription) {
            showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }
        
        if (!productImage) {
            showNotification('Vui lòng chọn hình ảnh sản phẩm!', 'error');
            return;
        }
        
        // Đọc hình ảnh dưới dạng base64
        const reader = new FileReader();
        reader.onload = function(e) {
            // Tạo sản phẩm mới
            const newProduct = {
                id: generateProductId(),
                name: productName,
                category: productCategory,
                price: productPrice,
                quantity: productQuantity,
                description: productDescription,
                image: e.target.result,
                createdAt: new Date().toISOString(),
                sizes: sizes.length ? sizes : undefined
            };
            
            // Lưu sản phẩm vào localStorage
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
            // Phát sự kiện tùy chỉnh để thông báo cho các trang khác
            window.dispatchEvent(new Event('productsUpdated'));
            
            // Reset form
            form.reset();
            imagePreview.innerHTML = `
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Kéo thả hình ảnh vào đây hoặc nhấn để tải lên</p>
            `;
            imagePreview.classList.remove('has-image');
            
            // Cập nhật bảng sản phẩm
            displayProductsTable(products);
            
            // Cập nhật dashboard
            loadDashboardData();
            
            // Hiển thị thông báo
            showNotification('Thêm sản phẩm thành công!', 'success');
            
            // Chuyển đến trang quản lý sản phẩm
            const productsTab = document.querySelector('a[data-section="products-management"]');
            if (productsTab) {
                productsTab.click();
            }
        };
        
        reader.readAsDataURL(productImage);
    });
}

// Tạo ID sản phẩm mới
function generateProductId() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    if (products.length === 0) return 1;
    
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
}

// Tải đơn hàng
function loadOrders() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    displayOrdersTable(orders);
    initOrderDetailsModal();
}

// membership classification based on total spent (VND)
// Đồng: 0 - 5,000,000 | Bạc: 6,000,000 - 15,000,000 | Vàng: >= 16,000,000
function getMembership(total) {
    if (total >= 16000000) return 'Vàng';
    if (total >= 6000000) return 'Bạc';
    if (total > 0) return 'Đồng';
    return '';
}

function getMembershipRank(membership) {
    if (membership === 'Vàng') return 3;
    if (membership === 'Bạc') return 2;
    if (membership === 'Đồng') return 1;
    return 0;
}

let historySortAsc = true;

function loadPurchaseHistory() {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    let history = users.map(user => {
        const userOrders = orders.filter(o => o.userId === user.id);
        const totalItems = userOrders.reduce((sum, o) => {
            const count = (o.items || []).reduce((s, i) => s + (parseInt(i.quantity) || 0), 0);
            return sum + count;
        }, 0);
        const totalMoney = userOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
        const membership = getMembership(totalMoney);
        return { user, totalItems, totalMoney, membership };
    }).filter(h => h.totalItems > 0 || h.totalMoney > 0);
    
    history = history.sort((a, b) => {
        const ra = getMembershipRank(a.membership);
        const rb = getMembershipRank(b.membership);
        return historySortAsc ? ra - rb : rb - ra;
    });
    displayHistoryTable(history);
}

function displayHistoryTable(history) {
    const tbody = document.getElementById('history-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (!history || history.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center">Không có lịch sử mua hàng</td></tr>`;
        return;
    }
    history.forEach(h => {
        const row = document.createElement('tr');
        const formattedTotal = h.totalMoney.toLocaleString('vi-VN') + ' VNĐ';
        const rank = getMembershipRank(h.membership);
        const medal = rank === 3 ? '🥇' : rank === 2 ? '🥈' : rank === 1 ? '🥉' : '';
        row.innerHTML = `
            <td>${h.user.id}</td>
            <td>${h.user.fullName}</td>
            <td>${h.user.email}</td>
            <td>${h.totalItems}</td>
            <td>${formattedTotal}</td>
            <td>${medal} ${h.membership || ''}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view btn-view-history" data-user-id="${h.user.id}" title="Xem chi tiết">
                    <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    document.querySelectorAll('.btn-view-history').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = parseInt(this.getAttribute('data-user-id'));
            showHistoryDetails(userId);
        });
    });
    const sortBtn = document.getElementById('membership-sort-btn');
    if (sortBtn) {
        sortBtn.onclick = function() {
            historySortAsc = !historySortAsc;
            loadPurchaseHistory();
            this.querySelector('i').className = historySortAsc ? 'fas fa-sort-amount-down' : 'fas fa-sort-amount-up';
        };
    }
}

function showHistoryDetails(userId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === userId);
    const modal = document.getElementById('history-detail-modal');
    const body = document.getElementById('history-detail-body');
    const title = document.getElementById('history-detail-title');
    if (!modal || !body || !title) return;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    title.textContent = `Lịch sử mua của ${user ? user.fullName : 'Người dùng'}`;
    if (userOrders.length === 0) {
        body.innerHTML = '<p>Không có đơn hàng nào.</p>';
    } else {
        let html = '';
        userOrders.forEach(order => {
            const orderDate = new Date(order.createdAt);
            const formattedDate = orderDate.toLocaleDateString('vi-VN');
            html += `<div class="order-block">
                        <h4>Đơn #${order.id} - ${formattedDate} - ${order.total.toLocaleString('vi-VN')} VNĐ</h4>
                        <table class="orders-table" style="width:100%; margin-bottom:15px;">
                            <thead>
                                <tr>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng</th>
                                    <th>Giá</th>
                                </tr>
                            </thead>
                            <tbody>`;
            (order.items || []).forEach(item => {
                html += `<tr>
                            <td>${item.name || item.title || ''}</td>
                            <td>${item.quantity}</td>
                            <td>${(parseFloat(item.price)||0).toLocaleString('vi-VN')} VNĐ</td>
                         </tr>`;
            });
            html += `     </tbody>
                        </table>
                    </div>`;
        });
        body.innerHTML = html;
    }
    modal.style.display = 'flex';
    const closeBtns = modal.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', () => { modal.style.display = 'none'; });
    });
    window.addEventListener('click', function handleOutside(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            window.removeEventListener('click', handleOutside);
        }
    });
}
// Hiển thị bảng đơn hàng
function displayOrdersTable(orders) {
    const tbody = document.getElementById('orders-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (orders.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Không có đơn hàng nào</td>
            </tr>
        `;
        return;
    }
    
    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format tổng tiền
        const formattedTotal = order.total.toLocaleString('vi-VN') + ' VNĐ';
        
        // Format ngày
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('vi-VN');
        
        // Lấy tên người nhận từ deliveryInfo hoặc customerName (để tương thích cũ)
        const customerName = order.deliveryInfo?.fullname || order.customerName || 'N/A';
        
        row.innerHTML = `
            <td>#${order.id}</td>
            <td>${customerName}</td>
            <td>${formattedDate}</td>
            <td>${formattedTotal}</td>
            <td>
                <span class="status-badge status-${order.status}">
                    ${getOrderStatusText(order.status)}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" data-order-id="${order.id}" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-delete-order" data-order-id="${order.id}" title="Xóa đơn hàng">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.role === 'staff_orders') {
        document.querySelectorAll('.orders-table .btn-delete-order').forEach(btn => {
            btn.setAttribute('disabled', 'true');
            btn.style.pointerEvents = 'none';
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }
}

// Lấy văn bản trạng thái đơn hàng
function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'packing': 'Đang đóng gói',
        'shipping': 'Đang vận chuyển',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    
    return statusMap[status] || status;
}

// Tải người dùng
function loadUsers() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Nếu không có người dùng, thêm người dùng mẫu
    if (users.length === 0) {
        const sampleUsers = getSampleUsers();
        localStorage.setItem('users', JSON.stringify(sampleUsers));
        displayUsersTable(sampleUsers);
    } else {
        displayUsersTable(users);
    }
}

// Tạo dữ liệu người dùng mẫu
function getSampleUsers() {
    return [
        {
            id: 1,
            fullName: 'Admin Custom Store',
            email: 'admin@customstore.com',
            role: 'admin',
            status: 'active',
            createdAt: new Date('2023-01-01').toISOString()
        },
        {
            id: 2,
            fullName: 'Nguyễn Văn A',
            email: 'user@example.com',
            role: 'user',
            status: 'active',
            createdAt: new Date('2023-05-15').toISOString()
        },
        {
            id: 3,
            fullName: 'Trần Thị B',
            email: 'tranthi.b@example.com',
            role: 'user',
            status: 'active',
            createdAt: new Date('2023-07-20').toISOString()
        },
        {
            id: 4,
            fullName: 'Lê Văn C',
            email: 'levan.c@example.com',
            role: 'user',
            status: 'inactive',
            createdAt: new Date('2023-09-10').toISOString()
        },
        {
            id: 5,
            fullName: 'Nhân viên Sản phẩm',
            email: 'staff.products@customstore.com',
            role: 'staff_products',
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString()
        },
        {
            id: 6,
            fullName: 'Nhân viên Đơn hàng',
            email: 'staff.orders@customstore.com',
            role: 'staff_orders',
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString()
        }
    ];
}

// Hiển thị bảng người dùng
function displayUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center">Không có người dùng nào</td>
            </tr>
        `;
        return;
    }
    
    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format ngày
        const userDate = new Date(user.createdAt);
        const formattedDate = userDate.toLocaleDateString('vi-VN');
        
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff_products' ? 'Nhân viên (xem sản phẩm)' : user.role === 'staff_orders' ? 'Nhân viên (xem đơn hàng)' : 'Người dùng'}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge status-${user.status}-user">
                    ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    initUserTableEvents();
}

function handleUserEdit() {
    const modal = document.getElementById('edit-user-modal');
    if (!modal) return;
    
    const userId = parseInt(this.getAttribute('data-user-id'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-user-status').value = user.status || 'active';
    document.getElementById('edit-user-role').value = user.role || 'user';
    modal.style.display = 'flex';
}

function handleUserDelete() {
    const userId = parseInt(this.getAttribute('data-user-id'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    if (confirm(`Bạn có chắc chắn muốn xóa người dùng "${user.fullName}"?`)) {
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem('users', JSON.stringify(filteredUsers));
        displayUsersTable(filteredUsers);
        loadDashboardData();
        showNotification('Xóa người dùng thành công!', 'success');
    }
}

function initUserTableEvents() {
    const modal = document.getElementById('edit-user-modal');
    const form = document.getElementById('edit-user-form');
    if (!modal || !form) return;
    document.querySelectorAll('.users-table .btn-edit[data-user-id]').forEach(btn => {
        btn.addEventListener('click', handleUserEdit);
    });
    
    // Delete button handler
    document.querySelectorAll('.users-table .btn-delete[data-user-id]').forEach(btn => {
        btn.addEventListener('click', handleUserDelete);
    });
    
    modal.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    window.addEventListener('click', function(e) {
        if (e.target === modal) modal.style.display = 'none';
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById('edit-user-id').value);
        const status = document.getElementById('edit-user-status').value;
        const role = document.getElementById('edit-user-role').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const idx = users.findIndex(u => u.id === id);
        if (idx !== -1) {
            users[idx].status = status;
            users[idx].role = role;
            localStorage.setItem('users', JSON.stringify(users));
            displayUsersTable(users);
            loadDashboardData();
        }
        modal.style.display = 'none';
        showNotification('Cập nhật người dùng thành công!', 'success');
    });
    
    // Search functionality
    const userSearchInput = document.getElementById('user-search');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', function() {
            const searchValue = this.value.toLowerCase();
            const users = JSON.parse(localStorage.getItem('users')) || [];
            
            const filteredUsers = users.filter(user => 
                user.fullName.toLowerCase().includes(searchValue) ||
                user.email.toLowerCase().includes(searchValue)
            );
            
            const tbody = document.getElementById('users-table-body');
            if (!tbody) return;
            
            tbody.innerHTML = '';
            
            if (!filteredUsers || filteredUsers.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">Không tìm thấy người dùng</td>
                    </tr>
                `;
                return;
            }
            
            filteredUsers.forEach(user => {
                const row = document.createElement('tr');
                const userDate = new Date(user.createdAt);
                const formattedDate = userDate.toLocaleDateString('vi-VN');
                
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${user.role === 'admin' ? 'Quản trị viên' : user.role === 'staff_products' ? 'Nhân viên (xem sản phẩm)' : user.role === 'staff_orders' ? 'Nhân viên (xem đơn hàng)' : 'Người dùng'}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <span class="status-badge status-${user.status}-user">
                            ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" data-user-id="${user.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" data-user-id="${user.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(row);
            });
            
            // Gắn lại event listeners cho các nút mới
            document.querySelectorAll('.users-table .btn-edit[data-user-id]').forEach(btn => {
                btn.removeEventListener('click', handleUserEdit);
                btn.addEventListener('click', handleUserEdit);
            });
            
            document.querySelectorAll('.users-table .btn-delete[data-user-id]').forEach(btn => {
                btn.removeEventListener('click', handleUserDelete);
                btn.addEventListener('click', handleUserDelete);
            });
        });
    }
}

// Khởi tạo chức năng đăng xuất
function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Xóa thông tin đăng nhập
            localStorage.removeItem('currentUser');
            
            // Chuyển hướng về trang đăng nhập
            window.location.href = 'login.html';
        });
    }
}

// Khởi tạo tìm kiếm và lọc
function initSearchAndFilter() {
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProductsTable();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterProductsTable();
        });
    }
}

// Lọc bảng sản phẩm
function filterProductsTable() {
    const searchInput = document.getElementById('product-search');
    const categoryFilter = document.getElementById('category-filter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    
    // Lấy tất cả sản phẩm
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    // Lọc sản phẩm
    const filteredProducts = products.filter(product => {
        // Lọc theo từ khóa tìm kiếm
        const matchesSearch = searchTerm === '' || 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm);
        
        // Lọc theo danh mục
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        
        return matchesSearch && matchesCategory;
    });
    
    // Hiển thị sản phẩm đã lọc
    displayProductsTable(filteredProducts);
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

// Khởi tạo modal chi tiết đơn hàng
function initOrderDetailsModal() {
    const modal = document.getElementById('order-details-modal');
    
    if (!modal) return;
    
    // Thêm event listener cho nút xem chi tiết
    document.addEventListener('click', function(e) {
        const viewBtn = e.target.closest('.btn-view[data-order-id]');
        if (viewBtn) {
            const orderId = viewBtn.getAttribute('data-order-id');
            showOrderDetails(orderId);
        }
        
        // Thêm event listener cho nút xóa đơn hàng
        const deleteBtn = e.target.closest('.btn-delete-order[data-order-id]');
        if (deleteBtn) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.role === 'staff_orders') {
                return;
            }
            const orderId = deleteBtn.getAttribute('data-order-id');
            deleteOrder(orderId);
        }
    });
    
    // Đóng modal
    const closeButtons = modal.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
    });
    
    // Click ra ngoài để đóng
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Hiển thị chi tiết đơn hàng
function showOrderDetails(orderId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const order = orders.find(o => String(o.id) === String(orderId));
    
    if (!order) {
        showNotification('Không tìm thấy đơn hàng', 'error');
        return;
    }
    
    const modal = document.getElementById('order-details-modal');
    
    // Hiển thị thông tin chung
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('modal-order-id').textContent = order.id;
    document.getElementById('modal-order-date').textContent = formattedDate;
    
    // Thiết lập giá trị hiện tại cho dropdown trạng thái
    const statusSelect = document.getElementById('modal-order-status-select');
    statusSelect.value = order.status || 'pending';
    
    document.getElementById('modal-payment-method').textContent = order.paymentMethodName || 'N/A';
    
    // Hiển thị thông tin giao hàng
    if (order.deliveryInfo) {
        const d = order.deliveryInfo;
        document.getElementById('modal-customer-name').textContent = d.fullname || 'N/A';
        document.getElementById('modal-customer-phone').textContent = d.phone || 'N/A';
        document.getElementById('modal-customer-province').textContent = d.province || (d.country === 'vietnam' ? 'N/A' : (d.country || 'N/A'));
        document.getElementById('modal-customer-district').textContent = d.district || 'N/A';
        document.getElementById('modal-customer-ward').textContent = d.ward || 'N/A';
        document.getElementById('modal-customer-address').textContent = d.address || 'N/A';
    } else {
        document.getElementById('modal-customer-name').textContent = 'N/A';
        document.getElementById('modal-customer-phone').textContent = 'N/A';
        document.getElementById('modal-customer-province').textContent = 'N/A';
        document.getElementById('modal-customer-district').textContent = 'N/A';
        document.getElementById('modal-customer-ward').textContent = 'N/A';
        document.getElementById('modal-customer-address').textContent = 'N/A';
    }
    
    // Hiển thị sản phẩm
    const itemsContainer = document.getElementById('modal-order-items');
    itemsContainer.innerHTML = '';
    
    if (order.items && order.items.length > 0) {
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.className = 'order-item-detail';
            itemElement.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-qty">Số lượng: ${item.quantity}</span>
                </div>
                <div class="item-price">
                    <span class="unit-price">${item.price.toLocaleString('vi-VN')} ₫</span>
                    <span class="total-price">${itemTotal.toLocaleString('vi-VN')} ₫</span>
                </div>
            `;
            itemsContainer.appendChild(itemElement);
        });
    }
    
    // Hiển thị tổng tiền
    document.getElementById('modal-subtotal').textContent = (order.subtotal || 0).toLocaleString('vi-VN') + ' ₫';
    document.getElementById('modal-shipping').textContent = (order.shippingFee || 0).toLocaleString('vi-VN') + ' ₫';
    document.getElementById('modal-discount').textContent = (order.discount || 0).toLocaleString('vi-VN') + ' ₫';
    document.getElementById('modal-total').textContent = (order.total || 0).toLocaleString('vi-VN') + ' ₫';
    
    // Thêm event listener cho nút xóa trong modal
    const deleteBtn = document.getElementById('delete-order-modal-btn');
    if (deleteBtn) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser && currentUser.role === 'staff_orders') {
            deleteBtn.setAttribute('disabled', 'true');
            deleteBtn.style.pointerEvents = 'none';
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
            deleteBtn.onclick = null;
        } else {
            deleteBtn.onclick = function() {
                deleteOrder(orderId);
            };
        }
    }
    
    // Thêm event listener cho nút lưu trạng thái đơn hàng
    const saveStatusBtn = document.getElementById('save-order-status-btn');
    if (saveStatusBtn) {
        const statusSelect = document.getElementById('modal-order-status-select');
        if (statusSelect) {
            statusSelect.removeAttribute('disabled');
        }
        saveStatusBtn.removeAttribute('disabled');
        saveStatusBtn.style.pointerEvents = '';
        saveStatusBtn.style.opacity = '';
        saveStatusBtn.style.cursor = '';
        saveStatusBtn.onclick = function() {
            const newStatus = document.getElementById('modal-order-status-select').value;
            saveOrderStatus(orderId, newStatus);
        };
    }
    
    // Hiển thị modal
    modal.style.display = 'flex';
}

// Lưu trạng thái đơn hàng
function saveOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const orderIndex = orders.findIndex(o => String(o.id) === String(orderId));
    
    if (orderIndex === -1) {
        showNotification('Không tìm thấy đơn hàng', 'error');
        return;
    }
    
    // Cập nhật trạng thái
    orders[orderIndex].status = newStatus;
    
    // Lưu vào localStorage
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Cập nhật bảng đơn hàng
    loadOrders();
    
    // Cập nhật dashboard
    loadDashboardData();
    
    // Hiển thị thông báo
    showNotification('Cập nhật trạng thái đơn hàng thành công!', 'success');
}

// Xóa đơn hàng
function deleteOrder(orderId) {
    // Xác nhận trước khi xóa
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn hàng ${orderId} không?\n\nHành động này không thể hoàn tác!`)) {
        return;
    }
    
    // Lấy danh sách đơn hàng
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    
    // Tìm vị trí đơn hàng
    const orderIndex = orders.findIndex(o => String(o.id) === String(orderId));
    
    if (orderIndex === -1) {
        showNotification('Không tìm thấy đơn hàng', 'error');
        return;
    }
    
    // Xóa đơn hàng
    orders.splice(orderIndex, 1);
    
    // Lưu lại danh sách
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Hiển thị thông báo thành công
    showNotification('Xóa đơn hàng thành công', 'success');
    
    // Đóng modal chi tiết nếu đang mở
    const modal = document.getElementById('order-details-modal');
    if (modal && modal.style.display === 'flex') {
        modal.style.display = 'none';
    }
    
    // Tải lại danh sách đơn hàng
    loadOrders();
    
    // Cập nhật dashboard
    loadDashboardData();
}

// Bài viết
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}
function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}
function loadPosts() {
    const posts = getPosts();
    displayPostsTable(posts);
}
function displayPostsTable(posts) {
    const tbody = document.getElementById('posts-table-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    if (posts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center">Chưa có bài viết nào</td>
            </tr>
        `;
        return;
    }
    posts.slice().reverse().forEach(post => {
        const date = new Date(post.createdAt);
        const formattedDate = date.toLocaleDateString('vi-VN');
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.author}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${post.status === 'visible' ? 'status-in-stock' : 'status-out-of-stock'}">
                    ${post.status === 'visible' ? 'Công khai' : 'Ẩn'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" data-post-id="${post.id}" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-post-id="${post.id}" title="Xóa"><i class="fas fa-trash"></i></button>
                    <button class="btn-secondary btn-toggle" data-post-id="${post.id}" title="Ẩn/Hiện">
                        <i class="fas fa-eye${post.status === 'hidden' ? '-slash' : ''}"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}
function initPostEvents() {
    const addBtn = document.getElementById('add-post-btn');
    const modal = document.getElementById('post-editor-modal');
    const form = document.getElementById('post-editor-form');
    const closeBtns = modal ? modal.querySelectorAll('.close-modal') : [];
    if (!addBtn || !modal || !form) return;
    document.querySelectorAll('.editor-toolbar [data-cmd]').forEach(btn => {
        btn.addEventListener('click', function() {
            const cmd = this.getAttribute('data-cmd');
            document.execCommand(cmd, false, null);
        });
    });
    const colorInput = document.getElementById('editor-color');
    if (colorInput) {
        colorInput.addEventListener('input', function() {
            document.execCommand('foreColor', false, this.value);
        });
    }
    const fontfamilySelect = document.getElementById('editor-fontfamily');
    if (fontfamilySelect) {
        fontfamilySelect.addEventListener('change', function() {
            if (this.value) {
                document.execCommand('fontName', false, this.value);
            }
        });
    }
    const sizeSelect = document.getElementById('editor-fontsize');
    if (sizeSelect) {
        sizeSelect.addEventListener('change', function() {
            if (this.value) {
                document.execCommand('fontSize', false, this.value);
            }
        });
    }
    const imageInput = document.getElementById('editor-image');
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.maxWidth = '100%';
                img.style.margin = '8px 0';
                const editor = document.getElementById('post-content');
                editor.appendChild(img);
            };
            reader.readAsDataURL(file);
            imageInput.value = '';
        });
    }
    addBtn.addEventListener('click', function() {
        document.getElementById('post-editor-title').textContent = 'Thêm bài viết';
        document.getElementById('post-id').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-author').value = '';
        document.getElementById('post-status').value = 'visible';
        document.getElementById('post-content').innerHTML = '';
        modal.style.display = 'flex';
    });
    closeBtns.forEach(btn => btn.addEventListener('click', function() {
        modal.style.display = 'none';
    }));
    window.addEventListener('click', function(e) {
        if (e.target === modal) modal.style.display = 'none';
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('post-id').value;
        const title = document.getElementById('post-title').value.trim();
        const author = document.getElementById('post-author').value.trim();
        const status = document.getElementById('post-status').value;
        const content = document.getElementById('post-content').innerHTML;
        if (!title || !author || !content) {
            showNotification('Vui lòng nhập đầy đủ tiêu đề, tác giả và nội dung', 'error');
            return;
        }
        const posts = getPosts();
        if (id) {
            const idx = posts.findIndex(p => String(p.id) === String(id));
            if (idx !== -1) {
                posts[idx].title = title;
                posts[idx].author = author;
                posts[idx].status = status;
                posts[idx].content = content;
                posts[idx].updatedAt = new Date().toISOString();
            }
        } else {
            const now = new Date();
            const newPost = {
                id: String(now.getTime()),
                title,
                author,
                status,
                content,
                createdAt: now.toISOString()
            };
            posts.push(newPost);
        }
        savePosts(posts);
        displayPostsTable(posts);
        modal.style.display = 'none';
        showNotification('Lưu bài viết thành công!', 'success');
    });
    document.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.btn-edit[data-post-id]');
        const deleteBtn = e.target.closest('.btn-delete[data-post-id]');
        const toggleBtn = e.target.closest('.btn-toggle[data-post-id]');
        if (editBtn) {
            const postId = editBtn.getAttribute('data-post-id');
            const posts = getPosts();
            const post = posts.find(p => String(p.id) === String(postId));
            if (!post) return;
            document.getElementById('post-editor-title').textContent = 'Sửa bài viết';
            document.getElementById('post-id').value = post.id;
            document.getElementById('post-title').value = post.title;
            document.getElementById('post-author').value = post.author;
            document.getElementById('post-status').value = post.status || 'visible';
            document.getElementById('post-content').innerHTML = post.content || '';
            modal.style.display = 'flex';
        }
        if (deleteBtn) {
            const postId = deleteBtn.getAttribute('data-post-id');
            if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
            let posts = getPosts();
            posts = posts.filter(p => String(p.id) !== String(postId));
            savePosts(posts);
            displayPostsTable(posts);
            showNotification('Đã xóa bài viết', 'success');
        }
        if (toggleBtn) {
            const postId = toggleBtn.getAttribute('data-post-id');
            const posts = getPosts();
            const idx = posts.findIndex(p => String(p.id) === String(postId));
            if (idx !== -1) {
                posts[idx].status = posts[idx].status === 'visible' ? 'hidden' : 'visible';
                savePosts(posts);
                displayPostsTable(posts);
            }
        }
    });
}
