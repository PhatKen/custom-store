// Khởi tạo dữ liệu mẫu nếu chưa có
const PRODUCTS_VERSION = 2;

function initializeSampleData() {
    // Khởi tạo người dùng mẫu
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (users.length === 0) {
        if (typeof getDefaultUsers === 'function') {
            users = getDefaultUsers();
        } else {
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
                },
                {
                    id: 5,
                    fullName: 'Nhân viên Sản phẩm',
                    email: 'products@customstore.com',
                    phone: '0900000001',
                    role: 'staff_products',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 6,
                    fullName: 'Nhân viên Đơn hàng',
                    email: 'orders@customstore.com',
                    phone: '0900000002',
                    role: 'staff_orders',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 7,
                    fullName: 'Thu ngân',
                    email: 'cashier@customstore.com',
                    phone: '0900000003',
                    role: 'cashier',
                    status: 'active',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 8,
                    fullName: 'Nhân viên Marketing',
                    email: 'marketing@customstore.com',
                    phone: '0900000004',
                    role: 'staff_marketing',
                    status: 'active',
                    createdAt: new Date().toISOString()
                }
            ];
        }
        
        localStorage.setItem('users', JSON.stringify(users));
        console.log('Đã khởi tạo dữ liệu người dùng mẫu');
    } else {
        let changed = false;
        users.forEach(u => {
            if (u.email === 'staff.products@customstore.com') {
                u.email = 'products@customstore.com';
                changed = true;
            }
            if (u.email === 'staff.orders@customstore.com') {
                u.email = 'orders@customstore.com';
                changed = true;
            }
        });
        if (changed) localStorage.setItem('users', JSON.stringify(users));
    }
    
    // Khởi tạo / cập nhật sản phẩm mẫu nếu chưa có hoặc version cũ
    let products = JSON.parse(localStorage.getItem('products')) || [];
    const storedVersion = parseInt(localStorage.getItem('productsVersion') || '0', 10);
    if (products.length === 0 || storedVersion !== PRODUCTS_VERSION) {
        products = getSampleProducts();
        localStorage.setItem('products', JSON.stringify(products));
        localStorage.setItem('productsVersion', String(PRODUCTS_VERSION));
        console.log('Đã khởi tạo/cập nhật dữ liệu sản phẩm mẫu');
    }
    
    // Không khởi tạo đơn hàng mẫu để doanh thu ban đầu = 0
}

// Gọi hàm khởi tạo dữ liệu
initializeSampleData();

const CONTACT_INFO_STORAGE_KEY = 'contactInfo';

function getDefaultContactInfo() {
    return {
        address: '123 Đường ABC, Quận XYZ, TP.HCM',
        phone: '0123 456 789',
        email: 'info@customstore.com',
        facebook: '',
        twitter: '',
        instagram: '',
        youtube: ''
    };
}

function getContactInfo() {
    const defaults = getDefaultContactInfo();
    const stored = JSON.parse(localStorage.getItem(CONTACT_INFO_STORAGE_KEY) || 'null');
    if (!stored || typeof stored !== 'object') return defaults;
    return { ...defaults, ...stored };
}

function renderSiteFooter() {
    const footer = document.querySelector('footer');
    if (!footer) return;

    const c = getContactInfo();
    const year = new Date().getFullYear();
    const safe = v => (v || '').trim();
    const address = safe(c.address);
    const phone = safe(c.phone);
    const email = safe(c.email);
    const facebook = safe(c.facebook);
    const twitter = safe(c.twitter);
    const instagram = safe(c.instagram);
    const youtube = safe(c.youtube);

    const socialItem = (href, iconClass) => {
        const url = safe(href);
        if (!url) return '';
        return `<a href="${url}" target="_blank" rel="noopener"><i class="${iconClass}"></i></a>`;
    };

    footer.innerHTML = `
        <div class="container">
            <div class="footer-content">
                <div class="footer-col">
                    <h3>Custom Store</h3>
                    <p>Địa chỉ: ${address}</p>
                    <p>Email: ${email}</p>
                    <p>Điện thoại: ${phone}</p>
                </div>
                <div class="footer-col">
                    <h3>Danh mục</h3>
                    <ul>
                        <li><a href="products.html?category=ao">Áo</a></li>
                        <li><a href="products.html?category=quan">Quần</a></li>
                        <li><a href="products.html?category=giay">Giày</a></li>
                        <li><a href="products.html?category=non">Nón</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Liên kết</h3>
                    <ul>
                        <li><a href="index.html">Trang chủ</a></li>
                        <li><a href="about.html">Về chúng tôi</a></li>
                        <li><a href="delivery.html?view=contact">Liên hệ</a></li>
                        <li><a href="cart.html">Giỏ hàng</a></li>
                    </ul>
                </div>
                <div class="footer-col">
                    <h3>Theo dõi chúng tôi</h3>
                    <div class="social-icons">
                        ${socialItem(facebook, 'fab fa-facebook')}
                        ${socialItem(instagram, 'fab fa-instagram')}
                        ${socialItem(twitter, 'fab fa-twitter')}
                        ${socialItem(youtube, 'fab fa-youtube')}
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; ${year} Custom Store. Tất cả các quyền được bảo lưu.</p>
            </div>
        </div>
    `;
}

function initContactViewOnDeliveryPage() {
    const isDelivery = /\/delivery\.html$/i.test(window.location.pathname);
    if (!isDelivery) return;

    const url = new URL(window.location.href);
    const view = url.searchParams.get('view');
    const isContactView = view === 'contact' || /#lien-he|#contact/i.test(url.hash || '');
    const deliverySection = document.querySelector('.delivery-section');
    const contactSection = document.getElementById('contact-view');
    if (!deliverySection || !contactSection) return;

    if (isContactView) {
        deliverySection.style.display = 'none';
        contactSection.style.display = '';

        const c = getContactInfo();
        const setText = (id, value) => {
            const el = document.getElementById(id);
            if (el) el.textContent = value || '';
        };
        setText('contact-page-address', c.address || '');
        setText('contact-page-phone', c.phone || '');
        setText('contact-page-email', c.email || '');

        const setLink = (id, href) => {
            const el = document.getElementById(id);
            if (!el) return;
            const v = (href || '').trim();
            if (!v) {
                el.style.display = 'none';
                return;
            }
            el.style.display = '';
            el.href = v;
        };
        setLink('contact-page-facebook', c.facebook);
        setLink('contact-page-twitter', c.twitter);
        setLink('contact-page-instagram', c.instagram);
        setLink('contact-page-youtube', c.youtube);
    } else {
        contactSection.style.display = 'none';
        deliverySection.style.display = '';
    }
}

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

    renderSiteFooter();
    initContactViewOnDeliveryPage();

    window.addEventListener('contactInfoUpdated', function() {
        renderSiteFooter();
        initContactViewOnDeliveryPage();
    });
    window.addEventListener('storage', function(e) {
        if (e && e.key === CONTACT_INFO_STORAGE_KEY) {
            renderSiteFooter();
            initContactViewOnDeliveryPage();
        }
    });
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

function initChatbot() {
    if (document.getElementById('chat-fab')) return;
    const fab = document.createElement('button');
    fab.className = 'chat-fab';
    fab.id = 'chat-fab';
    fab.innerHTML = '<i class="fas fa-comments"></i>';
    const panel = document.createElement('div');
    panel.className = 'chat-panel';
    panel.id = 'chat-panel';
    panel.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-left">
                <div class="chat-header-avatar" aria-hidden="true">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="chat-header-meta">
                    <div class="chat-header-title">Trợ lý Custom Store</div>
                    <div class="chat-header-status">
                        <span class="chat-online-dot" aria-hidden="true"></span>
                        <span class="chat-online-text">Đang hoạt động</span>
                    </div>
                </div>
            </div>
            <button class="chat-close" id="chat-close" type="button" aria-label="Đóng">×</button>
        </div>
        <div class="chat-body" id="chat-body"></div>
        <div class="chat-input">
            <input type="text" id="chat-input-text" placeholder="Nhập câu hỏi của bạn…" autocomplete="off">
            <button id="chat-send" type="button" aria-label="Gửi">
                <i class="fas fa-paper-plane"></i>
            </button>
        </div>
    `;
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    const body = panel.querySelector('#chat-body');
    const input = panel.querySelector('#chat-input-text');
    let lastDateKey = null;
    let typingEl = null;
    let typingTimer = null;

    function addDateSeparator() {
        const now = new Date();
        const dateKey = now.toISOString().slice(0, 10);
        if (lastDateKey !== dateKey) {
            lastDateKey = dateKey;
            const sep = document.createElement('div');
            sep.className = 'chat-date-separator';
            const dateLabel = now.toLocaleDateString('vi-VN');
            const timeLabel = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
            sep.textContent = `${dateLabel} • ${timeLabel}`;
            body.appendChild(sep);
        }
    }

    function scrollToBottom() {
        body.scrollTop = body.scrollHeight;
    }

    function addMsg(content, who) {
        addDateSeparator();
        const now = new Date();
        const timeLabel = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const row = document.createElement('div');
        row.className = `chat-message chat-message--${who}`;

        if (who === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'chat-message-avatar';
            avatar.setAttribute('aria-hidden', 'true');
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            row.appendChild(avatar);
        }

        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'chat-message-bubblewrap';

        const bubble = document.createElement('div');
        bubble.className = 'chat-message-bubble';

        if (typeof content === 'string') {
            const textEl = document.createElement('div');
            textEl.className = 'chat-message-text';
            textEl.textContent = content;
            bubble.appendChild(textEl);
        } else if (content instanceof HTMLElement) {
            bubble.appendChild(content);
        }

        const time = document.createElement('div');
        time.className = 'chat-message-time';
        time.textContent = timeLabel;

        bubbleWrap.appendChild(bubble);
        bubbleWrap.appendChild(time);
        row.appendChild(bubbleWrap);
        body.appendChild(row);
        scrollToBottom();
    }

    function showTyping() {
        if (typingEl) return;
        addDateSeparator();
        const row = document.createElement('div');
        row.className = 'chat-message chat-message--bot chat-message--typing';
        row.setAttribute('aria-live', 'polite');
        const avatar = document.createElement('div');
        avatar.className = 'chat-message-avatar';
        avatar.setAttribute('aria-hidden', 'true');
        avatar.innerHTML = '<i class="fas fa-robot"></i>';
        const bubbleWrap = document.createElement('div');
        bubbleWrap.className = 'chat-message-bubblewrap';
        const bubble = document.createElement('div');
        bubble.className = 'chat-message-bubble';
        const text = document.createElement('div');
        text.className = 'chat-typing';
        text.innerHTML = `<span>Bot đang trả lời</span><span class="chat-dots" aria-hidden="true"><i></i><i></i><i></i></span>`;
        bubble.appendChild(text);
        bubbleWrap.appendChild(bubble);
        row.appendChild(avatar);
        row.appendChild(bubbleWrap);
        typingEl = row;
        body.appendChild(row);
        scrollToBottom();
    }

    function hideTyping() {
        if (typingTimer) {
            clearTimeout(typingTimer);
            typingTimer = null;
        }
        if (!typingEl) return;
        typingEl.remove();
        typingEl = null;
    }

    function createQuickActions() {
        const quick = document.createElement('div');
        quick.className = 'chat-quick';
        const chips = [
            { t: 'Tra cứu đơn hàng', q: 'tra cứu đơn hàng', i: '📦' },
            { t: 'Sản phẩm rẻ nhất', q: 'sản phẩm rẻ nhất', i: '🏷️' },
            { t: 'Sản phẩm mắc nhất', q: 'sản phẩm mắc nhất', i: '💎' },
            { t: 'Danh mục Áo', q: 'xem sản phẩm áo', i: '👕' },
            { t: 'Danh mục Quần', q: 'xem sản phẩm quần', i: '👖' },
            { t: 'Danh mục Giày', q: 'xem sản phẩm giày', i: '👟' },
            { t: 'Danh mục Nón', q: 'xem sản phẩm nón', i: '🧢' },
            { t: 'Phí vận chuyển', q: 'phí vận chuyển', i: '🚚' },
            { t: 'Chính sách đổi trả', q: 'chính sách đổi trả', i: '🔁' },
            { t: 'Liên hệ', q: 'liên hệ cửa hàng', i: '☎️' }
        ];
        chips.forEach(c => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chat-chip';
            chip.innerHTML = `<span class="chat-chip-icon" aria-hidden="true">${c.i}</span><span class="chat-chip-text"></span>`;
            chip.querySelector('.chat-chip-text').textContent = c.t;
            chip.addEventListener('click', function() { handleUser(c.q); });
            quick.appendChild(chip);
        });
        return quick;
    }

    function createProductResult(products, options = {}) {
        const wrap = document.createElement('div');
        wrap.className = 'chat-product-result';
        const grid = document.createElement('div');
        grid.className = 'chat-product-grid';
        (products || []).forEach(p => {
            const card = document.createElement('div');
            card.className = 'chat-product-card';
            const img = document.createElement('img');
            const src = Array.isArray(p.images) && p.images.length ? p.images[0] : p.image;
            img.src = src || '';
            img.alt = p.name || 'Sản phẩm';
            img.onerror = function() {
                this.src = 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80';
            };
            const meta = document.createElement('div');
            meta.className = 'chat-product-meta';
            const name = document.createElement('div');
            name.className = 'chat-product-name';
            name.textContent = p.name || '';
            const price = document.createElement('div');
            price.className = 'chat-product-price';
            price.textContent = (typeof p.price === 'number' ? p.price.toLocaleString('vi-VN') + '₫' : '');
            const actions = document.createElement('div');
            actions.className = 'chat-product-actions';
            const view = document.createElement('button');
            view.type = 'button';
            view.className = 'chat-product-view';
            view.innerHTML = '<i class="fas fa-eye"></i><span>Xem sản phẩm</span>';
            view.addEventListener('click', function() {
                viewProductDetail(p.id);
            });
            actions.appendChild(view);
            meta.appendChild(name);
            meta.appendChild(price);
            meta.appendChild(actions);
            card.appendChild(img);
            card.appendChild(meta);
            grid.appendChild(card);
        });
        wrap.appendChild(grid);
        if (options.link) {
            const more = document.createElement('a');
            more.className = 'chat-more-link';
            more.href = options.link;
            more.textContent = options.linkText || 'Xem thêm';
            wrap.appendChild(more);
        }
        return wrap;
    }

    function greet() {
        addMsg('Xin chào! Bạn muốn tìm sản phẩm, tra cứu đơn hàng hay xem chính sách?', 'bot');
        body.appendChild(createQuickActions());
        scrollToBottom();
    }
    function handleUser(text) {
        if (!text) return;
        addMsg(text, 'user');
        respond(text);
    }
    function respond(text) {
        hideTyping();
        showTyping();
        const t = text.toLowerCase();
        typingTimer = setTimeout(() => {
            hideTyping();
            if (t.includes('tra cứu') || t.includes('đơn hàng')) {
                addMsg('Vui lòng nhập mã đơn hàng để mình kiểm tra.', 'bot');
                return;
            }
            const idMatch = t.match(/\b\d{6,}\b/);
            if (idMatch) {
                const id = idMatch[0];
                const orders = JSON.parse(localStorage.getItem('orders')) || [];
                const order = orders.find(o => String(o.id) === String(id));
                if (!order) {
                    addMsg(`Không tìm thấy đơn hàng ${id}.`, 'bot');
                } else {
                    addMsg(`Đơn ${id}: ${order.status}. Tổng: ${order.total.toLocaleString('vi-VN')}₫.`, 'bot');
                }
                return;
            }
            const products = JSON.parse(localStorage.getItem('products')) || [];
            if (t.includes('rẻ nhất')) {
                if (products.length === 0) { addMsg('Hiện chưa có dữ liệu sản phẩm.', 'bot'); return; }
                const cheapest = products.reduce((min, p) => p.price < min.price ? p : min, products[0]);
                addMsg(createProductResult([cheapest]), 'bot');
                return;
            }
            if (t.includes('mắc nhất') || t.includes('đắt nhất')) {
                if (products.length === 0) { addMsg('Hiện chưa có dữ liệu sản phẩm.', 'bot'); return; }
                const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);
                addMsg(createProductResult([mostExpensive]), 'bot');
                return;
            }
            if (t.includes('còn không')) {
                if (products.length === 0) { addMsg('Hiện chưa có dữ liệu sản phẩm.', 'bot'); return; }
                const found = products.find(p => t.includes((p.name || '').toLowerCase()));
                if (!found) {
                    addMsg('Bạn vui lòng nói rõ tên sản phẩm để tôi kiểm tra tồn kho.', 'bot');
                } else {
                    addMsg(`${found.name}: ${found.quantity > 0 ? 'Còn hàng' : 'Hết hàng'} (Số lượng: ${found.quantity}).`, 'bot');
                }
                return;
            }
            const prodMatch = t.match(/(áo|quần|giày|nón)/);
            if (prodMatch) {
                const catMap = { 'áo': 'ao', 'quần': 'quan', 'giày': 'giay', 'nón': 'non' };
                const cat = catMap[prodMatch[1]];
                const listItems = products.filter(p => p.category === cat);
                if (listItems.length === 0) {
                    addMsg(`Chưa có sản phẩm trong danh mục ${prodMatch[1]}.`, 'bot');
                } else {
                    const top = listItems.slice(0, 4);
                    addMsg(createProductResult(top, { link: `products.html?category=${cat}`, linkText: 'Xem thêm trong danh mục' }), 'bot');
                }
                return;
            }
            if (t.includes('phí vận chuyển') || t.includes('vận chuyển') || t.includes('ship')) {
                addMsg('Phí vận chuyển nội thành mặc định 20.000₫, có thể thay đổi theo khuyến mãi.', 'bot');
                return;
            }
            if (t.includes('đổi trả') || t.includes('chính sách')) {
                addMsg('Đổi trả trong 7 ngày cho sản phẩm chưa qua sử dụng, còn tag và hóa đơn.', 'bot');
                return;
            }
            if (t.includes('liên hệ') || t.includes('hotline') || t.includes('số điện thoại') || t.includes('địa chỉ') || t.includes('email') || t.includes('facebook') || t.includes('instagram') || t.includes('youtube') || t.includes('twitter') || /\bx\b/.test(t)) {
                const ci = getContactInfo();
                const v = s => (s || '').trim();
                const address = v(ci.address);
                const phone = v(ci.phone);
                const email = v(ci.email);
                const facebook = v(ci.facebook);
                const twitter = v(ci.twitter);
                const instagram = v(ci.instagram);
                const youtube = v(ci.youtube);

                if (t.includes('facebook')) {
                    addMsg(facebook ? `Facebook của Custom Store: ${facebook}` : 'Hiện chưa có link Facebook của cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('instagram')) {
                    addMsg(instagram ? `Instagram của Custom Store: ${instagram}` : 'Hiện chưa có link Instagram của cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('youtube')) {
                    addMsg(youtube ? `YouTube của Custom Store: ${youtube}` : 'Hiện chưa có link YouTube của cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('twitter') || /\bx\b/.test(t)) {
                    addMsg(twitter ? `X (Twitter) của Custom Store: ${twitter}` : 'Hiện chưa có link X (Twitter) của cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('email')) {
                    addMsg(email ? `Email cửa hàng: ${email}` : 'Hiện chưa có email của cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('địa chỉ')) {
                    addMsg(address ? `📍 Địa chỉ cửa hàng: ${address}` : 'Hiện chưa có địa chỉ cửa hàng.', 'bot');
                    return;
                }
                if (t.includes('hotline') || t.includes('số điện thoại')) {
                    addMsg(phone ? `📞 Số điện thoại cửa hàng: ${phone}` : 'Hiện chưa có số điện thoại cửa hàng.', 'bot');
                    return;
                }

                const lines = [
                    'Bạn có thể liên hệ Custom Store qua:',
                    address ? `📍 Địa chỉ: ${address}` : '',
                    phone ? `📞 Số điện thoại: ${phone}` : '',
                    email ? `📧 Email: ${email}` : '',
                    '',
                    'Theo dõi chúng tôi tại:',
                    facebook ? `Facebook: ${facebook}` : '',
                    twitter ? `X (Twitter): ${twitter}` : '',
                    instagram ? `Instagram: ${instagram}` : '',
                    youtube ? `YouTube: ${youtube}` : '',
                    '',
                    'Bạn cũng có thể xem trang Liên hệ tại: delivery.html?view=contact'
                ].filter(Boolean);
                addMsg(lines.join('\n'), 'bot');
                return;
            }
            addMsg('Tôi chưa hiểu yêu cầu. Bạn có thể thử: "tra cứu đơn hàng 16403013210203" hoặc "xem sản phẩm áo".', 'bot');
        }, 550);
    }
    fab.addEventListener('click', function(){
        panel.style.display = 'flex';
        if (!body.querySelector('.chat-message')) greet();
    });
    panel.querySelector('#chat-close').addEventListener('click', function(){
        panel.style.display = 'none';
        hideTyping();
    });
    panel.querySelector('#chat-send').addEventListener('click', function(){
        const v = input.value.trim();
        input.value = '';
        handleUser(v);
    });
    input.addEventListener('keydown', function(e){
        if (e.key === 'Enter') {
            const v = input.value.trim();
            input.value = '';
            handleUser(v);
        }
    });
}

document.addEventListener('DOMContentLoaded', function(){
    initChatbot();
});
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

function extractPostThumb(html) {
    const div = document.createElement('div');
    div.innerHTML = html || '';
    const img = div.querySelector('img');
    return img ? img.src : 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=600&auto=format&fit=crop';
}

function getHomeNewsData() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const visible = posts.filter(p => p.status !== 'hidden');
    if (visible.length === 0) {
        return [];
    }
    return visible.slice().reverse().map(post => {
        const date = new Date(post.createdAt);
        const dateText = date.toLocaleDateString('vi-VN');
        const baseContent = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const excerpt = baseContent.length > 160 ? baseContent.slice(0, 160) + '...' : baseContent;
        return {
            id: post.id,
            category: 'Bài viết',
            date: post.author ? `${dateText} • ${post.author}` : dateText,
            title: post.title,
            image: extractPostThumb(post.content),
            excerpt
        };
    });
}

let homeNewsIndex = 0;
let homeNewsTimer = null;
let homeNewsData = [];

function initHomeNews() {
    const container = document.getElementById('home-news-item');
    if (!container) return;
    homeNewsData = getHomeNewsData();
    if (homeNewsData.length === 0) return;
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
        if (typeof getDefaultProducts === 'function') {
            products = getDefaultProducts();
        } else {
            products = getSampleProducts();
        }
        localStorage.setItem('products', JSON.stringify(products));
    }
    
    // Sắp xếp theo số bán giảm dần và lấy 8 sản phẩm bán chạy nhất
    const topSellingProducts = products
        .sort((a, b) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 8);
    
    // Hiển thị sản phẩm
    displayProducts(topSellingProducts);
}

// Tạo dữ liệu sản phẩm mẫu (fallback khi không có item.js)
function getSampleProducts() {
    if (typeof getDefaultProducts === 'function') {
        return getDefaultProducts();
    }
    return [];
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
    const formattedPrice = product.price.toLocaleString('vi-VN') + '₫';
    
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

    const mainImage = Array.isArray(product.images) && product.images.length ? product.images[0] : product.image;
    const badge = getProductBadge(product);
    const badgeHtml = badge ? `<div class="product-badge badge-${badge.type}">${badge.text}</div>` : '';
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
            ${badgeHtml}
            ${isOutOfStock ? '<div class="out-of-stock-badge">Hết hàng</div>' : ''}
            <div class="product-quick-actions">
                ${loggedIn ? 
                    `<button class="btn-add-to-cart" data-product-id="${product.id}" ${isOutOfStock ? 'disabled' : ''}>
                        <i class="fas fa-shopping-cart"></i> ${isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>` 
                    : 
                    `<button class="btn-login-required" type="button">
                        <i class="fas fa-lock"></i> Hãy đăng nhập
                    </button>`
                }
                <button class="btn-view" data-product-id="${product.id}">
                    <i class="fas fa-eye"></i> Xem nhanh
                </button>
            </div>
        </div>
        <div class="product-info">
            <span class="product-category">${categoryNames[product.category]}</span>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <div class="product-price">${formattedPrice}</div>
        </div>
    `;
    
    // Thêm sự kiện cho nút thêm vào giỏ nếu đã đăng nhập và sản phẩm còn hàng
    if (loggedIn && !isOutOfStock) {
        const addToCartBtn = card.querySelector('.btn-add-to-cart');
        addToCartBtn.addEventListener('click', function() {
            addToCart(product.id);
        });
    } else if (!loggedIn) {
        const loginBtn = card.querySelector('.btn-login-required');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'login.html';
            });
        }
    }
    
    // Thêm sự kiện cho nút xem chi tiết
    const viewBtn = card.querySelector('.btn-view');
    viewBtn.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    // Thêm sự kiện cho hình ảnh sản phẩm
    const productImage = card.querySelector('.product-image');
    productImage.addEventListener('click', function(e) {
        if (e.target.closest('.product-quick-actions')) return;
        viewProductDetail(product.id);
    });
    
    // Thêm sự kiện cho tên sản phẩm
    const productName = card.querySelector('.product-name');
    productName.addEventListener('click', function() {
        viewProductDetail(product.id);
    });
    
    return card;
}

function getProductBadge(product) {
    const createdAt = product && product.createdAt ? new Date(product.createdAt) : null;
    const now = new Date();
    if (createdAt && !isNaN(createdAt.getTime())) {
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / 86400000);
        if (diffDays <= 14) return { text: 'NEW', type: 'new' };
    }
    if (typeof product.quantity === 'number' && product.quantity <= 10 && product.quantity > 0) {
        return { text: 'HOT', type: 'hot' };
    }
    if (typeof product.price === 'number' && product.price <= 300000) {
        return { text: 'SALE', type: 'sale' };
    }
    return null;
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
    const storedProducts = JSON.parse(localStorage.getItem('products')) || [];
    const stored = storedProducts.find(p => p.id == product.id);
    if (stored && typeof stored.description === 'string') {
        product.description = stored.description;
    }
    const productImages = Array.isArray(stored?.images) && stored.images.length
        ? stored.images
        : (Array.isArray(product.images) && product.images.length
            ? product.images
            : [product.image]);
    
    let currentPrice = product.price;
    let selectedSize = null;
    
    
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
    
    const baseSizes = ['S','M','L','XL','XXL'];
    const enabledSizes = Array.isArray(product.sizes) && product.sizes.length ? product.sizes : baseSizes;
    const sizeOrder = ['S','M','L','XL','XXL'];
    const sizes = enabledSizes
        .filter((s, idx, arr) => arr.indexOf(s) === idx && sizeOrder.includes(s))
        .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));
    const hasSizes = (product.category === 'ao' || product.category === 'quan') && sizes.length > 0;
    if (hasSizes) {
        selectedSize = sizes[0];
    }
    const sizeOptionsHTML = hasSizes ? `
        <div class="product-sizes">
            <span class="stock-label">Size:</span>
            <div class="size-options">
                ${sizes.map((size, index) => `
                    <button class="size-option${index === 0 ? ' active' : ''}" data-size="${size}" data-index="${index}" ${isOutOfStock ? 'disabled' : ''}>${size}</button>
                `).join('')}
            </div>
        </div>
    ` : '';
    
    const galleryImages = productImages;
    const mainImage = galleryImages[0];
    const thumbnailsHTML = galleryImages.map((src, index) => `
        <button class="product-gallery-thumb${index === 0 ? ' active' : ''}" data-index="${index}">
            <img src="${src}" alt="${product.name} ${index + 1}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
        </button>
    `).join('');

    const modalHTML = `
        <div class="modal active" id="product-detail-modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Chi tiết sản phẩm</h3>
                    <span class="close-modal">&times;</span>
                </div>
                <div class="modal-body product-detail">
                    <div class="product-detail-gallery">
                        <div class="product-gallery-thumbs">
                            ${thumbnailsHTML}
                        </div>
                        <div class="product-detail-image">
                            <img class="product-gallery-main-img" src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
                            ${isOutOfStock ? '<div class="out-of-stock-badge">Hết hàng</div>' : ''}
                        </div>
                    </div>
                    <div class="product-detail-info">
                        <h2 class="product-title">${product.name}</h2>
                        <div class="product-price">${currentPrice.toLocaleString('vi-VN')} VNĐ</div>
                        ${sizeOptionsHTML}
                        <div class="product-description">
                            <h4>Mô tả sản phẩm</h4>
                            <div class="product-description-content is-collapsed" id="product-description-content">${product.description}</div>
                            <button type="button" class="btn-desc-toggle" id="product-desc-toggle" style="display:none;">Xem thêm</button>
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
                        <h3>Sản phẩm liên quan</h3>
                        <div class="recommended-grid product-related-grid" id="product-recommended-products"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Thêm modal vào body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    document.body.classList.add('modal-open');
    
    const modal = document.getElementById('product-detail-modal');
    const priceEl = modal.querySelector('.product-price');
    const sizeButtons = modal.querySelectorAll('.size-option');
    const mainImgEl = modal.querySelector('.product-gallery-main-img');
    const thumbButtons = modal.querySelectorAll('.product-gallery-thumb');
    if (mainImgEl && thumbButtons.length) {
        thumbButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                thumbButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const idx = parseInt(this.getAttribute('data-index'), 10) || 0;
                const src = galleryImages[idx] || galleryImages[0];
                mainImgEl.src = src;
            });
        });
    }

    function updatePriceBySizeIndex(index) {
        if (!hasSizes) {
            currentPrice = product.price;
        } else {
            const multiplier = Math.pow(1.03, index);
            currentPrice = Math.round(product.price * multiplier);
            selectedSize = sizes[index];
        }
        if (priceEl) {
            priceEl.textContent = currentPrice.toLocaleString('vi-VN') + ' VNĐ';
        }
    }
    
    if (hasSizes && sizeButtons.length) {
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                if (this.hasAttribute('disabled')) return;
                sizeButtons.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const idx = parseInt(this.getAttribute('data-index'), 10) || 0;
                updatePriceBySizeIndex(idx);
            });
        });
        updatePriceBySizeIndex(0);
    } else {
        currentPrice = product.price;
        if (priceEl) {
            priceEl.textContent = currentPrice.toLocaleString('vi-VN') + ' VNĐ';
        }
    }
    
    let descResizeHandler = null;
    const closeProductDetailModal = () => {
        const el = document.getElementById('product-detail-modal');
        if (el && typeof el.__cleanup === 'function') {
            el.__cleanup();
            return;
        }
        if (descResizeHandler) {
            window.removeEventListener('resize', descResizeHandler);
            descResizeHandler = null;
        }
        const existing = document.getElementById('product-detail-modal');
        if (existing) existing.remove();
        document.body.classList.remove('modal-open');
    };
    modal.__cleanup = () => {
        if (descResizeHandler) {
            window.removeEventListener('resize', descResizeHandler);
            descResizeHandler = null;
        }
        const existing = document.getElementById('product-detail-modal');
        if (existing) existing.remove();
        document.body.classList.remove('modal-open');
    };

    // Thêm sự kiện cho nút đóng
    const closeButtons = document.querySelectorAll('#product-detail-modal .close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            closeProductDetailModal();
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
            closeProductDetailModal();
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
            closeProductDetailModal();
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 300);
        });
    }
    
    // Đóng modal khi click ra ngoài
    document.getElementById('product-detail-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeProductDetailModal();
        }
    });

    const descContent = document.getElementById('product-description-content');
    const descToggle = document.getElementById('product-desc-toggle');
    if (descContent && descToggle) {
        const refreshToggleVisibility = () => {
            descContent.classList.add('is-collapsed');
            const hasOverflow = descContent.scrollHeight - descContent.clientHeight > 4;
            descToggle.style.display = hasOverflow ? '' : 'none';
            if (!hasOverflow) {
                descContent.classList.remove('is-collapsed');
                descToggle.textContent = 'Xem thêm';
            } else {
                descToggle.textContent = 'Xem thêm';
            }
        };
        requestAnimationFrame(refreshToggleVisibility);
        descToggle.addEventListener('click', function() {
            const expanded = !descContent.classList.contains('is-collapsed');
            if (expanded) {
                descContent.classList.add('is-collapsed');
                this.textContent = 'Xem thêm';
            } else {
                descContent.classList.remove('is-collapsed');
                this.textContent = 'Thu gọn';
            }
        });
        descResizeHandler = refreshToggleVisibility;
        window.addEventListener('resize', descResizeHandler);
    }

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
    const recoImages = Array.isArray(recoProduct.images) && recoProduct.images.length ? recoProduct.images : [recoProduct.image];
    const recoMainImage = recoImages[0];
    card.innerHTML = `
        <div class="product-image">
            <img src="${recoMainImage}" alt="${recoProduct.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
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
        if (existing && typeof existing.__cleanup === 'function') existing.__cleanup();
        else if (existing) existing.remove();
        viewProductDetail(recoProduct.id);
    });
    const img = card.querySelector('.product-image');
    img.addEventListener('click', function() {
        const existing = document.getElementById('product-detail-modal');
        if (existing && typeof existing.__cleanup === 'function') existing.__cleanup();
        else if (existing) existing.remove();
        viewProductDetail(recoProduct.id);
    });
    const nameEl = card.querySelector('.product-name');
    nameEl.addEventListener('click', function() {
        const existing = document.getElementById('product-detail-modal');
        if (existing && typeof existing.__cleanup === 'function') existing.__cleanup();
        else if (existing) existing.remove();
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
        const membershipInfo = calculateUserMembership(currentUser.id);
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
                    ${membershipInfo.iconHtml}
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <a href="account.html" class="dropdown-item" id="edit-profile-btn">
                        <i class="fas fa-user-edit"></i> Chỉnh sửa tài khoản
                    </a>
                    <a href="account.html#my-orders" class="dropdown-item">
                        <i class="fas fa-receipt"></i> Đơn hàng của tôi
                    </a>
                    ${(currentUser.role === 'admin' || currentUser.role === 'staff_products' || currentUser.role === 'staff_orders' || currentUser.role === 'cashier' || currentUser.role === 'staff_marketing') ? 
                        `<a href="admin.html" class="dropdown-item">
                            <i class="fas fa-cog"></i> Quản lý admin
                        </a>` : ''}
                    <div class="dropdown-item" style="cursor:default;">
                        <i class="fas fa-trophy"></i> Membership: ${membershipInfo.label}
                    </div>
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

function calculateUserMembership(userId) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    const userOrders = orders.filter(o => o.userId === userId);
    const totalMoney = userOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    let label = 'Chưa có hạng';
    let iconHtml = '';
    if (totalMoney >= 16000000) {
        label = 'Vàng';
        iconHtml = '<i class="fas fa-medal" style="color:#ffc107;margin-left:6px;"></i>';
    } else if (totalMoney >= 6000000) {
        label = 'Bạc';
        iconHtml = '<i class="fas fa-medal" style="color:#ced4da;margin-left:6px;"></i>';
    } else if (totalMoney > 0) {
        label = 'Đồng';
        iconHtml = '<i class="fas fa-medal" style="color:#cd7f32;margin-left:6px;"></i>';
    }
    return { label, iconHtml, totalMoney };
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
