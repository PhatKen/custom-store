// Khởi tạo trang admin
document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo navigation
    initAdminNavigation();
    
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
    
    // Khởi tạo chức năng đăng xuất
    initLogout();
    
    // Khởi tạo tìm kiếm và lọc
    initSearchAndFilter();
});

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
    
    // Tải hoạt động gần đây
    loadRecentActivity(products, orders, users);
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
            time: formatTimeAgo(new Date(product.createdAt))
        });
    });
    
    // Thêm hoạt động từ đơn hàng
    orders.slice(-5).forEach(order => {
        activities.push({
            type: 'order-placed',
            title: 'Đơn hàng mới',
            description: `Đơn hàng #${order.id} từ ${order.customerName}`,
            time: formatTimeAgo(new Date(order.createdAt))
        });
    });
    
    // Thêm hoạt động từ người dùng
    users.slice(-5).forEach(user => {
        activities.push({
            type: 'user-registered',
            title: 'Người dùng mới',
            description: `${user.fullName} đã đăng ký tài khoản`,
            time: formatTimeAgo(new Date(user.createdAt))
        });
    });
    
    // Sắp xếp theo thời gian (mới nhất trước)
    activities.sort((a, b) => {
        // Đây là một cách đơn giản, trong thực tế nên so sánh bằng timestamp
        return Math.random() - 0.5; // Giả lập sắp xếp ngẫu nhiên
    });
    
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
        
        // Xác định trạng thái
        const status = product.quantity > 0 ? 'active' : 'out-of-stock';
        const statusText = product.quantity > 0 ? 'Còn hàng' : 'Hết hàng';
        
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
            <td>${product.quantity}</td>
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
        const updatedProduct = {
            id: parseInt(document.getElementById('edit-product-id').value),
            name: document.getElementById('edit-product-name').value,
            category: document.getElementById('edit-product-category').value,
            price: parseInt(document.getElementById('edit-product-price').value),
            quantity: parseInt(document.getElementById('edit-product-quantity').value),
            description: document.getElementById('edit-product-description').value,
            image: product.image, // Giữ nguyên hình ảnh cũ
            createdAt: product.createdAt
        };
        
        // Cập nhật trong mảng sản phẩm
        const productIndex = products.findIndex(p => p.id == updatedProduct.id);
        if (productIndex !== -1) {
            products[productIndex] = updatedProduct;
            
            // Lưu vào localStorage
            localStorage.setItem('products', JSON.stringify(products));
            
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
                image: e.target.result, // Lưu hình ảnh dưới dạng base64
                createdAt: new Date().toISOString()
            };
            
            // Lưu sản phẩm vào localStorage
            let products = JSON.parse(localStorage.getItem('products')) || [];
            products.push(newProduct);
            localStorage.setItem('products', JSON.stringify(products));
            
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
                    <button class="btn-view" data-order-id="${order.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
}

// Lấy văn bản trạng thái đơn hàng
function getOrderStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'processing': 'Đang xử lý',
        'completed': 'Hoàn thành',
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
            <td>${user.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</td>
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
    const order = orders.find(o => o.id === orderId);
    
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
    document.getElementById('modal-order-status').textContent = getOrderStatusText(order.status);
    document.getElementById('modal-payment-method').textContent = order.paymentMethodName || 'N/A';
    
    // Hiển thị thông tin giao hàng
    if (order.deliveryInfo) {
        document.getElementById('modal-customer-name').textContent = order.deliveryInfo.fullname || 'N/A';
        document.getElementById('modal-customer-phone').textContent = order.deliveryInfo.phone || 'N/A';
        document.getElementById('modal-customer-address').textContent = order.deliveryInfo.address || 'N/A';
    } else {
        document.getElementById('modal-customer-name').textContent = 'N/A';
        document.getElementById('modal-customer-phone').textContent = 'N/A';
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
    
    // Hiển thị modal
    modal.style.display = 'flex';
}