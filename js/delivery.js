// Khởi tạo trang delivery
document.addEventListener('DOMContentLoaded', function() {
    updateUserHeader();
    updateCartCount();
    loadDeliveryStatus();
});

// Tải trạng thái giao hàng
function loadDeliveryStatus() {
    const lastOrder = JSON.parse(sessionStorage.getItem('lastOrder'));
    
    if (!lastOrder) {
        window.location.href = 'cart.html';
        return;
    }
    
    // Hiển thị thông tin đơn hàng
    displayOrderInfo(lastOrder);
    
    // Hiển thị thông tin người nhận
    displayReceiverInfo(lastOrder);
    
    // Hiển thị các mục đơn hàng
    displayOrderItems(lastOrder);
}

// Hiển thị thông tin đơn hàng
function displayOrderInfo(order) {
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    document.getElementById('order-id-display').textContent = order.id;
    document.getElementById('order-date-display').textContent = formattedDate;
    document.getElementById('order-total-display').textContent = order.total.toLocaleString('vi-VN') + ' ₫';
    
    // Hiển thị thời gian xác nhận
    document.getElementById('confirmed-time').textContent = formattedDate;
}

// Hiển thị thông tin người nhận
function displayReceiverInfo(order) {
    document.getElementById('receiver-name').textContent = order.deliveryInfo.fullname;
    document.getElementById('receiver-phone').textContent = order.deliveryInfo.phone;
    document.getElementById('receiver-address').textContent = order.deliveryInfo.address;
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
}
