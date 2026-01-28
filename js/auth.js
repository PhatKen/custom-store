// Khởi tạo trang đăng nhập/đăng ký
document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra nếu đã đăng nhập
    checkLoggedIn();
    
    // Khởi tạo tabs
    initAuthTabs();
    
    // Khởi tạo form đăng nhập
    initLoginForm();
    
    // Khởi tạo form đăng ký
    initRegisterForm();
    
    // Khởi tạo form quên mật khẩu
    initForgotPasswordForm();
    
    // Khởi tạo nút hiển thị/ẩn mật khẩu
    initPasswordToggles();
    
    // Khởi tạo kiểm tra độ mạnh mật khẩu
    initPasswordStrengthChecker();
    
    // Khởi tạo đăng nhập bằng mạng xã hội
    initSocialLogin();
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

// Khởi tạo tabs đăng nhập/đăng ký
function initAuthTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Cập nhật active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Hiển thị form tương ứng
            forms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabName}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Chuyển đổi giữa đăng nhập và đăng ký
    document.getElementById('switch-to-register')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-tab="register"]').click();
    });
    
    document.getElementById('switch-to-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
    
    // Quên mật khẩu
    document.getElementById('forgot-password')?.addEventListener('click', function(e) {
        e.preventDefault();
        showForgotPasswordForm();
    });
    
    // Quay lại đăng nhập từ quên mật khẩu
    document.getElementById('back-to-login')?.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.auth-tab[data-tab="login"]').click();
    });
}

// Hiển thị form quên mật khẩu
function showForgotPasswordForm() {
    // Ẩn tất cả các form
    document.querySelectorAll('.auth-form').forEach(form => {
        form.classList.remove('active');
    });
    
    // Hiển thị form quên mật khẩu
    document.getElementById('forgot-password-form').classList.add('active');
    
    // Cập nhật tabs (ẩn cả hai)
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
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

// Khởi tạo form đăng ký
function initRegisterForm() {
    const form = document.getElementById('registerForm');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Lấy dữ liệu từ form
        const firstName = document.getElementById('register-firstname').value.trim();
        const lastName = document.getElementById('register-lastname').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const phone = document.getElementById('register-phone').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const acceptTerms = document.getElementById('accept-terms').checked;
        
        // Kiểm tra dữ liệu
        if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
            showAuthNotification('Vui lòng điền đầy đủ thông tin', 'error');
            return;
        }
        
        if (!acceptTerms) {
            showAuthNotification('Vui lòng đồng ý với điều khoản dịch vụ', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showAuthNotification('Mật khẩu xác nhận không khớp', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthNotification('Mật khẩu phải có ít nhất 6 ký tự', 'error');
            return;
        }
        
        // Kiểm tra email đã tồn tại chưa
        if (isEmailExists(email)) {
            showAuthNotification('Email đã được sử dụng', 'error');
            return;
        }
        
        // Đăng ký người dùng mới
        registerUser(firstName, lastName, email, phone, password);
    });
}

// Kiểm tra email đã tồn tại chưa
function isEmailExists(email) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.some(user => user.email === email);
}

// Đăng ký người dùng mới
function registerUser(firstName, lastName, email, phone, password) {
    // Lấy người dùng từ localStorage
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Tạo ID mới
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1;
    
    // Tạo người dùng mới
    const newUser = {
        id: newId,
        fullName: `${lastName} ${firstName}`,
        email: email,
        phone: phone,
        role: 'user',
        status: 'active',
        createdAt: new Date().toISOString()
    };
    
    // Thêm người dùng mới
    users.push(newUser);
    
    // Lưu vào localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Đăng nhập ngay sau khi đăng ký
    const currentUser = {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        role: newUser.role
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Hiển thị thông báo thành công
    showAuthNotification('Đăng ký thành công!', 'success');
    
    // Chuyển hướng về trang chủ sau 1 giây
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
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
                document.querySelector('.auth-tab[data-tab="login"]').click();
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

// Khởi tạo kiểm tra độ mạnh mật khẩu
function initPasswordStrengthChecker() {
    const passwordInput = document.getElementById('register-password');
    const strengthBar = document.querySelector('.strength-bar');
    const strengthText = document.querySelector('.strength-text span');
    
    if (!passwordInput || !strengthBar || !strengthText) return;
    
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        const strength = calculatePasswordStrength(password);
        
        // Cập nhật thanh độ mạnh
        let width, color, text;
        
        switch (strength) {
            case 0:
                width = '20%';
                color = '#dc3545';
                text = 'Rất yếu';
                break;
            case 1:
                width = '40%';
                color = '#ff6b6b';
                text = 'Yếu';
                break;
            case 2:
                width = '60%';
                color = '#ffc107';
                text = 'Trung bình';
                break;
            case 3:
                width = '80%';
                color = '#28a745';
                text = 'Mạnh';
                break;
            case 4:
                width = '100%';
                color = '#20c997';
                text = 'Rất mạnh';
                break;
            default:
                width = '0%';
                color = '#e9ecef';
                text = '';
        }
        
        strengthBar.style.width = width;
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    });
}

// Tính độ mạnh mật khẩu
function calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    return strength;
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