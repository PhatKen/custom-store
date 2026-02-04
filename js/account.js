// Khởi tạo trang tài khoản
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadAccountInfo();
    setupEventListeners();
    initAddressSelectors();
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
    
    // Nếu người dùng chưa có địa chỉ, lấy từ đơn hàng gần nhất
    let province = user.province || '';
    let district = user.district || '';
    let ward = user.ward || '';
    let addressDetail = user.addressDetail || '';
    
    if (!addressDetail) {
        const orders = JSON.parse(localStorage.getItem('orders')) || [];
        const userOrders = orders.filter(order => order.userId === user.id);
        
        if (userOrders.length > 0) {
            // Lấy đơn hàng gần nhất
            const lastOrder = userOrders[userOrders.length - 1];
            if (lastOrder.deliveryInfo) {
                province = lastOrder.deliveryInfo.province || '';
                district = lastOrder.deliveryInfo.district || '';
                ward = lastOrder.deliveryInfo.ward || '';
                addressDetail = lastOrder.deliveryInfo.address || '';
            }
        }
    }
    
    // Điền các giá trị
    document.getElementById('edit-province').value = province;
    
    // Trigger change event để load districts
    if (province) {
        const provinceSelect = document.getElementById('edit-province');
        provinceSelect.dispatchEvent(new Event('change'));
        
        // Điền district sau khi districts được load
        setTimeout(() => {
            document.getElementById('edit-district').value = district;
            const districtSelect = document.getElementById('edit-district');
            districtSelect.dispatchEvent(new Event('change'));
            
            // Điền ward sau khi wards được load
            setTimeout(() => {
                document.getElementById('edit-ward').value = ward;
            }, 100);
        }, 100);
    }
    
    document.getElementById('edit-address').value = addressDetail;
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
    const province = document.getElementById('edit-province').value.trim();
    const district = document.getElementById('edit-district').value.trim();
    const ward = document.getElementById('edit-ward').value.trim();
    const addressDetail = document.getElementById('edit-address').value.trim();
    
    if (!fullName) {
        showNotification('Vui lòng nhập họ tên', 'error');
        return;
    }
    
    // Tạo địa chỉ đầy đủ
    let fullAddress = addressDetail;
    if (ward) fullAddress = ward + ', ' + fullAddress;
    if (district) fullAddress = district + ', ' + fullAddress;
    if (province) {
        const provinceName = vietnamAddressData[province]?.name || province;
        fullAddress = provinceName + ', ' + fullAddress;
    }
    
    // Cập nhật thông tin
    users[userIndex].fullName = fullName;
    users[userIndex].phone = phone;
    users[userIndex].address = fullAddress;
    users[userIndex].province = province;
    users[userIndex].district = district;
    users[userIndex].ward = ward;
    users[userIndex].addressDetail = addressDetail;
    
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

// Dữ liệu địa chỉ Việt Nam
const vietnamAddressData = {
    'Ha Noi': {
        name: 'Hà Nội',
        districts: {
            'Ba Dinh': { name: 'Ba Đình', wards: ['Phúc Tân', 'Quán Thánh', 'Nguyễn Hữu Thọ', 'Kim Mã', 'Trúc Bạch', 'Cầu Giấy', 'Vĩnh Phúc'] },
            'Hai Ba Trung': { name: 'Hai Bà Trưng', wards: ['Bách Khoa', 'Giáp Bát', 'Hàng Bông', 'Hàng Giai', 'Lý Thái Tổ', 'Tràng Tây', 'Tràng Tiền'] },
            'Hoan Kiem': { name: 'Hoàn Kiếm', wards: ['Cửa Đông', 'Cửa Nam', 'Cửa Bắc', 'Hàng Bạc', 'Hàng Buồm', 'Thanh Nê'] },
            'Dong Da': { name: 'Đống Đa', wards: ['Hàng Bột', 'Lê Đại Hành', 'Phương Liên', 'Quỳnh Mai', 'Quỳnh Lôi', 'Thổ Quan', 'Nguyễn Du'] }
        }
    },
    'Ho Chi Minh': {
        name: 'Thành phố Hồ Chí Minh',
        districts: {
            'District 1': { name: 'Quận 1', wards: ['Bến Nghé', 'Bến Thành', 'Cầu Kè', 'Cầu Ông Lãnh', 'Đa Kao', 'Nguyễn Hữu Cảnh', 'Phạm Ngũ Lão', 'Tân Định'] },
            'District 3': { name: 'Quận 3', wards: ['Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13'] },
            'District 5': { name: 'Quận 5', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'] },
            'District 7': { name: 'Quận 7', wards: ['Phú Mỹ', 'Tân Hưng', 'Tân Kiểng', 'Tân Phong', 'Tân Quy'] }
        }
    },
    'Da Nang': {
        name: 'Đà Nẵng',
        districts: {
            'Hai Chau': { name: 'Hải Châu', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10'] },
            'Thanh Khe': { name: 'Thanh Khê', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'] },
            'Cam Le': { name: 'Cẩm Lệ', wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'] }
        }
    }
};

// Khởi tạo combobox địa chỉ
function initAddressSelectors() {
    const provinceSelect = document.getElementById('edit-province');
    const districtSelect = document.getElementById('edit-district');
    const wardSelect = document.getElementById('edit-ward');
    
    if (!provinceSelect) return;
    
    // Thêm các tỉnh/thành phố của Việt Nam
    Object.keys(vietnamAddressData).forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = vietnamAddressData[key].name;
        provinceSelect.appendChild(option);
    });
    
    // Sự kiện thay đổi tỉnh/thành phố
    provinceSelect.addEventListener('change', function() {
        const selectedProvince = this.value;
        
        // Xóa các lựa chọn cũ
        districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (selectedProvince && vietnamAddressData[selectedProvince]) {
            const province = vietnamAddressData[selectedProvince];
            Object.keys(province.districts).forEach(key => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = province.districts[key].name;
                districtSelect.appendChild(option);
            });
        }
    });
    
    // Sự kiện thay đổi quận/huyện
    districtSelect.addEventListener('change', function() {
        const selectedProvince = provinceSelect.value;
        const selectedDistrict = this.value;
        
        // Xóa các lựa chọn cũ
        wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
        
        if (selectedProvince && selectedDistrict && vietnamAddressData[selectedProvince]) {
            const province = vietnamAddressData[selectedProvince];
            if (province.districts[selectedDistrict]) {
                const wards = province.districts[selectedDistrict].wards;
                wards.forEach(ward => {
                    const option = document.createElement('option');
                    option.value = ward;
                    option.textContent = ward;
                    wardSelect.appendChild(option);
                });
            }
        }
    });
}
