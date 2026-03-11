// Khởi tạo trang tài khoản
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadAccountInfo();
    setupEventListeners();
    initAddressSelectors();
    initOrdersSectionRouting();
    loadUserOrders();
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
    const formatAddress = typeof window !== 'undefined' && typeof window.formatAddressParts === 'function'
        ? window.formatAddressParts
        : ((detail, ward, district, city) => [detail, ward, district, city].filter(Boolean).join(', '));
    const fullAddress = formatAddress(user.addressDetail || '', user.ward || '', user.district || '', user.province || '') || user.address || '--';
    document.getElementById('display-address').textContent = fullAddress;
    const nameDisplay = document.getElementById('user-name-display');
    const emailDisplay = document.getElementById('user-email-display');
    const membershipBadge = document.getElementById('user-membership-badge');
    const membershipInfo = calculateUserMembership(user.id);
    if (nameDisplay) {
        nameDisplay.textContent = user.fullName || user.email || 'User';
    }
    if (emailDisplay) {
        emailDisplay.textContent = user.email || '';
    }
    if (membershipBadge) {
        const span = membershipBadge.querySelector('span');
        if (span) {
            span.textContent = 'Membership: ' + (membershipInfo.label || '--');
        }
    }
    
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
                addressDetail = lastOrder.deliveryInfo.addressDetail || '';
            }
        }
    }
    
    const provinceSelect = document.getElementById('edit-province');
    const districtSelect = document.getElementById('edit-district');
    const wardSelect = document.getElementById('edit-ward');
    if (provinceSelect) provinceSelect.dataset.initialName = province || '';
    if (districtSelect) districtSelect.dataset.initialName = district || '';
    if (wardSelect) wardSelect.dataset.initialName = ward || '';
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

// Hiển thị/ẩn phần "Đơn hàng của tôi" dựa theo hash
function initOrdersSectionRouting() {
    function applyRoute() {
        const hash = window.location.hash;
        const ordersSection = document.getElementById('orders-section');
        const displayMode = document.getElementById('display-mode');
        const editForm = document.getElementById('edit-form');
        if (!ordersSection || !displayMode || !editForm) return;
        if (hash === '#my-orders') {
            ordersSection.style.display = 'block';
            displayMode.classList.remove('active');
            editForm.classList.remove('active');
        } else {
            ordersSection.style.display = 'none';
            displayMode.classList.add('active');
            editForm.classList.remove('active');
        }
    }
    window.addEventListener('hashchange', applyRoute);
    applyRoute();
}

// Tải đơn hàng của người dùng và hiển thị
function loadUserOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const ordersList = document.getElementById('orders-list');
    const ordersEmpty = document.getElementById('orders-empty');
    if (!currentUser || !ordersList || !ordersEmpty) return;
    
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === currentUser.id);
    
    ordersList.innerHTML = '';
    if (userOrders.length === 0) {
        ordersEmpty.style.display = 'block';
        return;
    }
    ordersEmpty.style.display = 'none';
    
    userOrders.slice().reverse().forEach(order => {
        const container = document.createElement('div');
        container.className = 'order-card';
        const itemsHTML = (order.items || []).map(item => {
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            return `
                <div class="order-item">
                    <div class="order-item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="order-item-info">
                        <h4>${item.name}</h4>
                        <p class="order-item-quantity">Số lượng: ${item.quantity}</p>
                    </div>
                    <div class="order-item-price">
                        <p class="unit-price">${(item.price || 0).toLocaleString('vi-VN')} ₫</p>
                        <p class="total-price">${itemTotal.toLocaleString('vi-VN')} ₫</p>
                    </div>
                </div>
            `;
        }).join('');
        const delivery = order.deliveryInfo || {};
        const formatAddress = typeof window !== 'undefined' && typeof window.formatAddressParts === 'function'
            ? window.formatAddressParts
            : ((detail, w, d, p) => [detail, w, d, p].filter(Boolean).join(', '));
        const deliveryAddress = formatAddress(delivery.addressDetail || '', delivery.ward || '', delivery.district || '', delivery.province || '') || (delivery.address || '');
        container.innerHTML = `
            <div class="order-card-header">
                <div class="order-card-head-left">
                    <div class="order-id">Mã đơn: ${order.id}</div>
                    <div class="order-date">Ngày đặt: ${new Date(order.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
                </div>
                <div class="order-card-head-right">
                    <div class="order-total">${(order.total || 0).toLocaleString('vi-VN')} VNĐ</div>
                    <div class="order-ship">Phí ship: ${(order.shippingFee || 0).toLocaleString('vi-VN')} VNĐ</div>
                </div>
            </div>
            <div class="order-card-status">
                Trạng thái: <span class="order-status">${order.status || 'confirmed'}</span>
            </div>
            <button class="order-toggle">Xem chi tiết đơn hàng</button>
            <div class="order-card-detail">
                <div class="order-items">${itemsHTML}</div>
                <div class="order-delivery">
                    <div class="order-delivery-title">Thông tin giao hàng</div>
                    <div class="order-delivery-grid">
                        <div><span>Người nhận:</span> <strong>${delivery.fullname || ''}</strong></div>
                        <div><span>Số điện thoại:</span> <strong>${delivery.phone || ''}</strong></div>
                        <div class="order-delivery-address"><span>Địa chỉ:</span> <strong>${deliveryAddress}</strong></div>
                    </div>
                </div>
                <div class="order-detail-actions">
                    <a href="delivery.html?id=${order.id}" class="btn-secondary">Xem trạng thái giao hàng</a>
                </div>
            </div>
        `;
        const toggleBtn = container.querySelector('.order-toggle');
        const detail = container.querySelector('.order-card-detail');
        toggleBtn.addEventListener('click', function() {
            const isOpen = detail.style.display !== 'none';
            detail.style.display = isOpen ? 'none' : 'block';
            this.textContent = isOpen ? 'Xem chi tiết đơn hàng' : 'Ẩn chi tiết đơn hàng';
        });
        ordersList.appendChild(container);
    });
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
async function saveAccountInfo(e) {
    e.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = currentUser ? users.findIndex(u => u.id === currentUser.id) : -1;
    
    if (userIndex === -1) {
        showNotification('Không tìm thấy tài khoản', 'error');
        return;
    }
    
    const submitBtn = document.querySelector('#edit-form .btn-save');
    const originalBtnText = submitBtn ? (submitBtn.dataset.originalText || submitBtn.textContent) : '';
    if (submitBtn) {
        submitBtn.dataset.originalText = originalBtnText;
        submitBtn.textContent = 'Đang lưu...';
        submitBtn.disabled = true;
    }
    
    try {
        const fullName = document.getElementById('edit-fullname').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const provinceSelect = document.getElementById('edit-province');
        const districtSelect = document.getElementById('edit-district');
        const wardSelect = document.getElementById('edit-ward');
        const addressDetail = document.getElementById('edit-address').value.trim();

        const province = provinceSelect && provinceSelect.selectedIndex > 0
            ? provinceSelect.options[provinceSelect.selectedIndex].textContent
            : '';
        const district = districtSelect && districtSelect.selectedIndex > 0
            ? districtSelect.options[districtSelect.selectedIndex].textContent
            : '';
        const ward = wardSelect && wardSelect.selectedIndex > 0
            ? wardSelect.options[wardSelect.selectedIndex].textContent
            : '';
        
        if (!fullName) {
            showNotification('Vui lòng nhập họ tên', 'error');
            return;
        }
        
        const formatAddress = typeof window !== 'undefined' && typeof window.formatAddressParts === 'function'
            ? window.formatAddressParts
            : ((detail, w, d, p) => [detail, w, d, p].filter(Boolean).join(', '));
        const fullAddress = formatAddress(addressDetail, ward, district, province);

        const payload = {
            fullName,
            phone,
            province,
            district,
            ward,
            addressDetail
        };
        
        console.log('Update profile payload:', payload);
        
        const updatedUser = {
            ...users[userIndex],
            ...payload,
            address: fullAddress
        };
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        displayUserInfo(users[userIndex]);
        toggleEditMode();
        showNotification('Cập nhật tài khoản thành công!', 'success');
    } catch (err) {
        showNotification(err.message || 'Có lỗi xảy ra khi cập nhật tài khoản', 'error');
    } finally {
        if (submitBtn) {
            submitBtn.textContent = originalBtnText || 'Lưu Thay Đổi';
            submitBtn.disabled = false;
        }
    }
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

const ACCOUNT_PROVINCES_API_BASE = 'https://provinces.open-api.vn/api';
let accountProvinces = null;
const accountDistrictsByProvince = {};
const accountWardsByDistrict = {};

async function accountFetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Request failed: ' + res.status);
    }
    return res.json();
}

// Khởi tạo combobox địa chỉ
function initAddressSelectors() {
    const provinceSelect = document.getElementById('edit-province');
    const districtSelect = document.getElementById('edit-district');
    const wardSelect = document.getElementById('edit-ward');
    
    if (!provinceSelect || !districtSelect || !wardSelect) return;

    const initialProvinceName = provinceSelect.dataset.initialName || '';
    const initialDistrictName = districtSelect.dataset.initialName || '';
    const initialWardName = wardSelect.dataset.initialName || '';

    function setSelectState(select, placeholder, disabled) {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        select.disabled = !!disabled;
    }

    async function loadProvinces() {
        setSelectState(provinceSelect, 'Đang tải tỉnh/thành...', true);
        setSelectState(districtSelect, 'Chọn quận/huyện', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!accountProvinces) {
                accountProvinces = await accountFetchJson(`${ACCOUNT_PROVINCES_API_BASE}/p/`);
            }
            provinceSelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            accountProvinces
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = String(p.code);
                    opt.textContent = p.name;
                    provinceSelect.appendChild(opt);
                });
            provinceSelect.disabled = false;

            if (initialProvinceName) {
                const opt = Array.from(provinceSelect.options).find(o => o.textContent === initialProvinceName);
                if (opt) {
                    provinceSelect.value = opt.value;
                    await loadDistricts(opt.value, true);
                }
            }
        } catch (err) {
            setSelectState(provinceSelect, 'Không tải được tỉnh/thành', true);
            showNotification('Không tải được danh sách tỉnh/thành. Vui lòng thử lại.', 'error');
        }
    }

    async function loadDistricts(provinceCode, applyInitial) {
        if (!provinceCode) {
            setSelectState(districtSelect, 'Chọn quận/huyện', true);
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        setSelectState(districtSelect, 'Đang tải quận/huyện...', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!accountDistrictsByProvince[provinceCode]) {
                const data = await accountFetchJson(`${ACCOUNT_PROVINCES_API_BASE}/p/${provinceCode}?depth=2`);
                accountDistrictsByProvince[provinceCode] = data.districts || [];
            }
            const districts = accountDistrictsByProvince[provinceCode];
            districtSelect.innerHTML = '<option value="">Chọn quận/huyện</option>';
            districts
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(d => {
                    const opt = document.createElement('option');
                    opt.value = String(d.code);
                    opt.textContent = d.name;
                    districtSelect.appendChild(opt);
                });
            districtSelect.disabled = false;

            if (applyInitial && initialDistrictName) {
                const opt = Array.from(districtSelect.options).find(o => o.textContent === initialDistrictName);
                if (opt) {
                    districtSelect.value = opt.value;
                    await loadWards(opt.value, true);
                }
            }
        } catch (err) {
            setSelectState(districtSelect, 'Không tải được quận/huyện', true);
            showNotification('Không tải được danh sách quận/huyện. Vui lòng thử lại.', 'error');
        }
    }

    async function loadWards(districtCode, applyInitial) {
        if (!districtCode) {
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        setSelectState(wardSelect, 'Đang tải phường/xã...', true);
        try {
            if (!accountWardsByDistrict[districtCode]) {
                const data = await accountFetchJson(`${ACCOUNT_PROVINCES_API_BASE}/d/${districtCode}?depth=2`);
                accountWardsByDistrict[districtCode] = data.wards || [];
            }
            const wards = accountWardsByDistrict[districtCode];
            wardSelect.innerHTML = '<option value="">Chọn phường/xã</option>';
            wards
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(w => {
                    const opt = document.createElement('option');
                    opt.value = String(w.code);
                    opt.textContent = w.name;
                    wardSelect.appendChild(opt);
                });
            wardSelect.disabled = false;

            if (applyInitial && initialWardName) {
                const opt = Array.from(wardSelect.options).find(o => o.textContent === initialWardName);
                if (opt) {
                    wardSelect.value = opt.value;
                }
            }
        } catch (err) {
            setSelectState(wardSelect, 'Không tải được phường/xã', true);
            showNotification('Không tải được danh sách phường/xã. Vui lòng thử lại.', 'error');
        }
    }

    provinceSelect.addEventListener('change', function() {
        const selectedProvinceCode = this.value;
        districtSelect.dataset.initialName = '';
        wardSelect.dataset.initialName = '';
        loadDistricts(selectedProvinceCode, false);
    });

    districtSelect.addEventListener('change', function() {
        const selectedDistrictCode = this.value;
        wardSelect.dataset.initialName = '';
        loadWards(selectedDistrictCode, false);
    });

    loadProvinces();
}
