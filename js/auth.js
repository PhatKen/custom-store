// Khởi tạo trang đăng nhập/đăng ký
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra nếu đã đăng nhập
    checkLoggedIn();
    
    // Khởi tạo form đăng nhập
    initLoginForm();
    
    // Khởi tạo form quên mật khẩu
    initForgotPasswordForm();
    
    // Khởi tạo nút hiển thị/ẩn mật khẩu
    initPasswordToggles();
    
    // Khởi tạo đăng nhập bằng mạng xã hội
    initSocialLogin();
    
    // Xử lý quên mật khẩu
    document.getElementById('forgot-password')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('forgot-password-form').style.display = 'block';
    });
    
    // Quay lại đăng nhập từ quên mật khẩu
    document.getElementById('back-to-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('forgot-password-form').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });
});

// Kiểm tra nếu đã đăng nhập
function checkLoggedIn() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (currentUser) {
        // Nếu đã đăng nhập, chuyển hướng
        if (currentUser.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
    }
}

// Khởi tạo form đăng nhập
function initLoginForm() {
    const form = document.getElementById('loginForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy dữ liệu từ form
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        // Kiểm tra dữ liệu
        if (!email || !password) {
            showAuthNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        // Xác thực người dùng
        authenticateUser(email, password, rememberMe);
    });
}

// Xác thực người dùng
function authenticateUser(email, password, rememberMe) {
    // Khởi tạo dữ liệu mẫu nếu chưa có
    initializeSampleData();
    
    // Lấy người dùng từ localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tìm người dùng
    const user = users.find(u => u.email === email && u.status === 'active');
    
    // Kiểm tra thông tin đăng nhập
    if (!user) {
        showAuthNotification('Email hoặc mật khẩu không đúng', 'error');
        return;
    }
    
    // Trong thực tế, mật khẩu phải được mã hóa và so sánh
    // Ở đây, chúng ta sử dụng mật khẩu mặc định cho tài khoản mẫu
    const defaultPasswords = {
        'admin@customstore.com': 'admin123',
        'user@example.com': 'user123',
        'tranthi.b@example.com': 'password123',
        'levan.c@example.com': 'password123'
    };
    
    // Kiểm tra mật khẩu
    if (defaultPasswords[email] && defaultPasswords[email] === password) {
        // Đăng nhập thành công
        
        // Lưu thông tin người dùng hiện tại
        const currentUser = {
            id: user.id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Lưu thông tin đăng nhập nếu chọn "Ghi nhớ đăng nhập"
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }
        
        // Chuyển hướng dựa trên vai trò
        if (user.role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'index.html';
        }
        
        showAuthNotification('Đăng nhập thành công!', 'success');
    } else {
        showAuthNotification('Email hoặc mật khẩu không đúng', 'error');
    }
}

// Hàm khởi tạo dữ liệu mẫu
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
        products = [
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
        console.log('Đã khởi tạo dữ liệu sản phẩm mẫu');
    }
}

// Khởi tạo form quên mật khẩu
function initForgotPasswordForm() {
    const form = document.getElementById('forgotPasswordForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('forgot-email').value.trim();
        
        if (!email) {
            showAuthNotification('Vui lòng nhập email của bạn', 'error');
            return;
        }
        
        // Kiểm tra email có tồn tại không
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.email === email);
        
        if (userExists) {
            // Trong thực tế, gửi email đặt lại mật khẩu
            showAuthNotification('Liên kết đặt lại mật khẩu đã được gửi đến email của bạn', 'success');
            
            // Quay lại form đăng nhập sau 2 giây
            setTimeout(() => {
                document.getElementById('forgot-password-form').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
                form.reset();
            }, 2000);
        } else {
            showAuthNotification('Email không tồn tại trong hệ thống', 'error');
        }
    });
}

// Khởi tạo nút hiển thị/ẩn mật khẩu
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const input = this.closest('.password-input').querySelector('input');
            const icon = this.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// Khởi tạo đăng nhập bằng mạng xã hội
function initSocialLogin() {
    // Đăng nhập bằng Google
    document.querySelectorAll('.social-btn.google').forEach(button => {
        button.addEventListener('click', function() {
            showAuthNotification('Tính năng đăng nhập bằng Google đang được phát triển', 'info');
        });
    });
    
    // Đăng nhập bằng Facebook
    document.querySelectorAll('.social-btn.facebook').forEach(button => {
        button.addEventListener('click', function() {
            showAuthNotification('Tính năng đăng nhập bằng Facebook đang được phát triển', 'info');
        });
    });
}

// Hiển thị thông báo xác thực
function showAuthNotification(message, type = 'info') {
    // Tạo thông báo
    const notification = document.createElement('div');
    notification.className = `auth-notification auth-notification-${type}`;
    notification.innerHTML = `
        <div class="auth-notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Thêm CSS cho thông báo xác thực
    if (!document.querySelector('.auth-notification-styles')) {
        const style = document.createElement('style');
        style.className = 'auth-notification-styles';
        style.textContent = `
            .auth-notification {
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
            
            .auth-notification-success {
                border-left-color: var(--success-color);
            }
            
            .auth-notification-error {
                border-left-color: var(--danger-color);
            }
            
            .auth-notification-info {
                border-left-color: var(--primary-color);
            }
            
            .auth-notification-content i {
                font-size: 20px;
            }
            
            .auth-notification-success .auth-notification-content i {
                color: var(--success-color);
            }
            
            .auth-notification-error .auth-notification-content i {
                color: var(--danger-color);
            }
            
            .auth-notification-info .auth-notification-content i {
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