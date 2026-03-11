// Khởi tạo trang delivery
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadDeliveryStatus();
});

function getOrderStatusText(status) {
    const statusMap = {
        pending: 'Chờ xử lý',
        confirmed: 'Đã xác nhận',
        packing: 'Đang đóng gói',
        shipping: 'Đang vận chuyển',
        delivered: 'Đã giao hàng',
        cancelled: 'Đã hủy'
    };
    return statusMap[status] || status || '—';
}

function getTimelineIndex(status) {
    const s = (status || '').toLowerCase();
    if (s === 'delivered') return 3;
    if (s === 'shipping') return 2;
    if (s === 'packing') return 1;
    if (s === 'cancelled') return -1;
    return 0;
}

function formatDateTime(iso) {
    const d = new Date(iso || '');
    if (isNaN(d.getTime())) return '--';
    return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Tải trạng thái giao hàng
function loadDeliveryStatus() {
    const url = new URL(window.location.href);
    const fromSession = JSON.parse(sessionStorage.getItem('lastOrder') || 'null');
    const idFromUrl = url.searchParams.get('id');
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const fromStore = idFromUrl ? orders.find(o => String(o.id) === String(idFromUrl)) : null;
    const lastOrder = fromSession || fromStore;
    if (!lastOrder) return;
    
    // Hiển thị thông tin đơn hàng
    displayOrderInfo(lastOrder);
    
    // Hiển thị thông tin người nhận
    displayReceiverInfo(lastOrder);
    
    // Hiển thị các mục đơn hàng
    displayOrderItems(lastOrder);

    updateDeliveryTimeline(lastOrder);
}

function updateDeliveryTimeline(order) {
    const status = (order && order.status) ? String(order.status) : 'confirmed';
    const statusPill = document.getElementById('delivery-status-pill');
    if (statusPill) statusPill.textContent = getOrderStatusText(status);

    const idx = getTimelineIndex(status);
    const items = document.querySelectorAll('.delivery-timeline-item[data-step]');
    const steps = ['confirmed', 'packing', 'shipping', 'delivered'];
    items.forEach(node => {
        node.classList.remove('is-done', 'is-active', 'is-inactive');
        const step = node.getAttribute('data-step');
        const stepIdx = steps.indexOf(step);
        if (idx === -1) {
            node.classList.add('is-inactive');
            return;
        }
        if (stepIdx < idx) node.classList.add('is-done');
        else if (stepIdx === idx) node.classList.add('is-active');
        else node.classList.add('is-inactive');
    });

    const created = order && order.createdAt ? order.createdAt : null;
    const confirmedTime = document.getElementById('confirmed-time');
    if (confirmedTime) confirmedTime.textContent = created ? formatDateTime(created) : '--';

    const packingTime = document.getElementById('packing-time');
    const shippingTime = document.getElementById('shipping-time');
    const deliveredTime = document.getElementById('delivered-time');
    if (packingTime) packingTime.textContent = idx >= 1 ? 'Đang cập nhật' : '--';
    if (shippingTime) shippingTime.textContent = idx >= 2 ? 'Đang cập nhật' : '--';
    if (deliveredTime) deliveredTime.textContent = idx >= 3 ? 'Đang cập nhật' : '--';
}

// Hiển thị thông tin đơn hàng
function displayOrderInfo(order) {
    const formattedDate = formatDateTime(order.createdAt);
    
    document.getElementById('order-id-display').textContent = order.id;
    const heroId = document.getElementById('order-id-hero');
    if (heroId) heroId.textContent = order.id;
    document.getElementById('order-date-display').textContent = formattedDate;
    document.getElementById('order-total-display').textContent = order.total.toLocaleString('vi-VN') + ' ₫';
    
    // Hiển thị thời gian xác nhận
    const confirmedTime = document.getElementById('confirmed-time');
    if (confirmedTime) confirmedTime.textContent = formattedDate;
}

// Hiển thị thông tin người nhận
function displayReceiverInfo(order) {
    const d = order && order.deliveryInfo ? order.deliveryInfo : {};
    document.getElementById('receiver-name').textContent = d.fullname || '--';
    document.getElementById('receiver-phone').textContent = d.phone || '--';
    const formatAddress = typeof window !== 'undefined' && typeof window.formatAddressParts === 'function'
        ? window.formatAddressParts
        : ((detail, ward, district, city) => [detail, ward, district, city].filter(Boolean).join(', '));
    const addr = formatAddress(d.addressDetail || '', d.ward || '', d.district || '', d.province || '') || d.address || '--';
    document.getElementById('receiver-address').textContent = addr;
}

// Hiển thị các mục đơn hàng
function displayOrderItems(order) {
    const itemsList = document.getElementById('delivery-items-list');
    
    itemsList.innerHTML = '';
    
    order.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        const itemElement = document.createElement('div');
        itemElement.className = 'delivery-item';
        itemElement.innerHTML = `
            <div class="delivery-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="delivery-item-info">
                <h4>${item.name}</h4>
                <p class="delivery-item-quantity">Số lượng: ${item.quantity}</p>
            </div>
            <div class="delivery-item-price">
                <p class="unit-price">${item.price.toLocaleString('vi-VN')} ₫</p>
                <p class="total-price">${itemTotal.toLocaleString('vi-VN')} ₫</p>
            </div>
        `;
        
        itemsList.appendChild(itemElement);
    });
    
    // Hiển thị tóm tắt đơn hàng
    displayOrderSummary(order);
}

// Hiển thị tóm tắt chi phí đơn hàng
function displayOrderSummary(order) {
    const subtotal = order.subtotal || order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = order.shippingFee || 0;
    const discount = order.discount || 0;
    const total = order.total;
    
    // Tính giá gốc (trước khi giảm)
    const originalTotal = subtotal + shippingFee;
    
    // Hiển thị các mục
    document.getElementById('summary-subtotal').textContent = subtotal.toLocaleString('vi-VN') + ' ₫';
    document.getElementById('summary-shipping').textContent = shippingFee.toLocaleString('vi-VN') + ' ₫';
    document.getElementById('summary-total').textContent = total.toLocaleString('vi-VN') + ' ₫';
    
    // Nếu có giảm giá, hiển thị giá gốc
    if (discount > 0) {
        document.getElementById('discount-row').style.display = 'flex';
        document.getElementById('original-price-row').style.display = 'flex';
        document.getElementById('summary-discount').textContent = discount.toLocaleString('vi-VN') + ' ₫';
        document.getElementById('summary-original-total').textContent = originalTotal.toLocaleString('vi-VN') + ' ₫';
    }
}
