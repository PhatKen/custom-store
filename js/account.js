// Khởi tạo trang tài khoản
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadAccountInfo();
    setupEventListeners();
});

// Tải thông tin tài khoản
function loadAccountInfo() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Lấy thông tin đầy đủ của người dùng từ danh sách users
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userFullInfo = users.find(u => u.id === currentUser.id);
    
    if (!userFullInfo) {
        window.location.href = 'login.html';
        return;
    }
    
    // Hiển thị thông tin
    displayUserInfo(userFullInfo);
    
    // Điền thông tin vào form chỉnh sửa
    fillEditForm(userFullInfo);
}

// Hiển thị thông tin người dùng
function displayUserInfo(user) {
    document.getElementById('display-fullname').textContent = user.fullName || '--';
    document.getElementById('display-phone').textContent = user.phone || '--';
    document.getElementById('display-address').textContent = user.address || '--';
    document.getElementById('user-email-display').textContent = user.email;
    
    // Cập nhật avatar
    if (user.avatar) {
        document.getElementById('avatar-display').src = user.avatar;
    } else {
        document.getElementById('avatar-display').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=52c87e&color=fff&size=120`;
    }
}

// Điền thông tin vào form chỉnh sửa
function fillEditForm(user) {
    document.getElementById('edit-fullname').value = user.fullName || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-address').value = user.address || '';
}

// Thiết lập event listeners
function setupEventListeners() {
    // Nút chỉnh sửa
    document.getElementById('btn-edit').addEventListener('click', toggleEditMode);
    
    // Nút hủy chỉnh sửa
    document.getElementById('btn-cancel-edit').addEventListener('click', toggleEditMode);
    
    // Nút xóa tài khoản
    document.getElementById('btn-delete').addEventListener('click', showDeleteConfirm);
    
    // Modal xóa
    document.getElementById('confirm-delete').addEventListener('click', deleteAccount);
    document.getElementById('cancel-delete').addEventListener('click', hideDeleteConfirm);
    
    // Form chỉnh sửa
    document.getElementById('edit-form').addEventListener('submit', saveAccountInfo);
    
    // Upload avatar
    document.getElementById('avatar-input').addEventListener('change', handleAvatarUpload);
}

// Chuyển đổi chế độ chỉnh sửa
function toggleEditMode() {
    const displayMode = document.getElementById('display-mode');
    const editForm = document.getElementById('edit-form');
    
    displayMode.classList.toggle('active');
    editForm.classList.toggle('active');
}

// Xử lý upload avatar
function handleAvatarUpload(event) {
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const avatarData = e.target.result;
            document.getElementById('avatar-display').src = avatarData;
            
            // Lưu avatar vào localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.id === currentUser.id);
            
            if (userIndex !== -1) {
                users[userIndex].avatar = avatarData;
                localStorage.setItem('users', JSON.stringify(users));
                showNotification('Avatar đã được cập nhật!', 'success');
            }
        };
        reader.readAsDataURL(file);
    }
}

// Lưu thông tin tài khoản
function saveAccountInfo(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy tài khoản', 'error');
        return;
    }
    
    const fullName = document.getElementById('edit-fullname').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const address = document.getElementById('edit-address').value.trim();
    
    if (!fullName) {
        showNotification('Vui lòng nhập họ tên', 'error');
        return;
    }
    
    // Cập nhật thông tin
    users[userIndex].fullName = fullName;
    users[userIndex].phone = phone;
    users[userIndex].address = address;
    
    // Lưu vào localStorage
    localStorage.setItem('users', JSON.stringify(users));
    
    // Cập nhật currentUser nếu cần
    currentUser.fullName = fullName;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Refresh display
    displayUserInfo(users[userIndex]);
    
    // Chuyển về chế độ hiển thị
    toggleEditMode();
    
    showNotification('Thông tin tài khoản đã được cập nhật!', 'success');
}

// Hiển thị modal xác nhận xóa
function showDeleteConfirm() {
    document.getElementById('delete-modal').classList.add('active');
}

// Ẩn modal xác nhận xóa
function hideDeleteConfirm() {
    document.getElementById('delete-modal').classList.remove('active');
}

// Xóa tài khoản
function deleteAccount() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Xóa người dùng khỏi danh sách
    const filteredUsers = users.filter(u => u.id !== currentUser.id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
    
    // Xóa currentUser
    localStorage.removeItem('currentUser');
    
    // Ẩn modal
    hideDeleteConfirm();
    
    // Hiển thị thông báo và chuyển hướng
    showNotification('Tài khoản của bạn đã được xóa!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1500);
}
