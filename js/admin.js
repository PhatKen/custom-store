const ADMIN_ROLE_CONFIG = {
    admin: {
        sections: ['dashboard', 'analytics', 'products-management', 'add-product', 'orders', 'purchase-history', 'users', 'posts', 'contact-management'],
        permissions: {
            products: { manage: true },
            orders: { delete: true, updateStatus: true },
            users: { manage: true },
            posts: { manage: true },
            contact: { manage: true }
        }
    },
    staff_products: {
        sections: ['dashboard', 'products-management', 'add-product'],
        permissions: {
            products: { manage: true }
        }
    },
    staff_orders: {
        sections: ['dashboard', 'orders', 'purchase-history'],
        permissions: {
            orders: { delete: false, updateStatus: false }
        }
    },
    cashier: {
        sections: ['dashboard', 'analytics', 'purchase-history'],
        permissions: {}
    },
    staff_marketing: {
        sections: ['dashboard', 'posts', 'contact-management'],
        permissions: {
            posts: { manage: true },
            contact: { manage: true }
        }
    }
};

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

function getRoleConfig(role) {
    return ADMIN_ROLE_CONFIG[role] || null;
}

function canAccessAdmin(role) {
    return !!getRoleConfig(role);
}

function canAccessSection(sectionId) {
    const currentUser = getCurrentUser();
    const role = currentUser?.role;
    const config = getRoleConfig(role);
    if (!config) return false;
    return config.sections.includes(sectionId);
}

function hasPermission(area, action) {
    const currentUser = getCurrentUser();
    const role = currentUser?.role;
    const config = getRoleConfig(role);
    if (!config) return false;
    return !!(config.permissions && config.permissions[area] && config.permissions[area][action]);
}

function getRoleLabel(role) {
    const labels = {
        admin: 'Quản trị viên',
        staff_products: 'Nhân viên (sản phẩm)',
        staff_orders: 'Nhân viên (đơn hàng)',
        cashier: 'Thu ngân',
        staff_marketing: 'Nhân viên (marketing)',
        user: 'Người dùng'
    };
    return labels[role] || 'Người dùng';
}

function migrateStaffEmails() {
    const oldToNew = {
        'staff.products@customstore.com': 'products@customstore.com',
        'staff.orders@customstore.com': 'orders@customstore.com'
    };

    const users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.length) {
        let changed = false;
        users.forEach(u => {
            const nextEmail = oldToNew[u.email];
            if (nextEmail) {
                u.email = nextEmail;
                changed = true;
            }
        });
        if (changed) localStorage.setItem('users', JSON.stringify(users));
    }

    const currentUser = getCurrentUser();
    if (currentUser && oldToNew[currentUser.email]) {
        currentUser.email = oldToNew[currentUser.email];
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

// Khởi tạo trang admin
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    if (!canAccessAdmin(currentUser.role)) {
        window.location.href = 'index.html';
        return;
    }

    migrateStaffEmails();

    initAdminNavigation();
    applyRoleRestrictions();

    loadDashboardData();
    loadProductsForAdmin();
    initAddProductForm();
    initContactManagement();
    loadOrders();
    loadUsers();
    initUserTableEvents();
    loadPurchaseHistory();
    loadPosts();
    initPostEvents();
    initLogout();
    initSearchAndFilter();
    initAnalytics();
    initAdminScrollLock();
});

function applyRoleRestrictions() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const role = currentUser.role;
    const config = getRoleConfig(role);
    if (!config) return;

    const allowedSections = new Set(config.sections);

    document.querySelectorAll('.admin-menu a[data-section]').forEach(link => {
        const sectionId = link.getAttribute('data-section');
        const li = link.closest('li');
        const allowed = allowedSections.has(sectionId);
        if (li) li.style.display = allowed ? '' : 'none';
    });

    document.querySelectorAll('.admin-section').forEach(sec => {
        const allowed = allowedSections.has(sec.id);
        sec.style.display = allowed ? '' : 'none';
        sec.classList.remove('active');
    });

    const menuLinks = document.querySelectorAll('.admin-menu a[data-section]');
    menuLinks.forEach(item => item.classList.remove('active'));

    const initialSection = config.sections.includes('dashboard') ? 'dashboard' : config.sections[0];
    const initialLink = document.querySelector(`.admin-menu a[data-section="${initialSection}"]`);
    const initialSectionEl = document.getElementById(initialSection);
    if (initialLink) initialLink.classList.add('active');
    if (initialSectionEl) initialSectionEl.classList.add('active');
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

function initAdminScrollLock() {
    const main = document.querySelector('.admin-main');
    if (!main) return;
    const header = document.querySelector('.admin-header');

    const forwardWheel = e => {
        main.scrollTop += e.deltaY;
        e.preventDefault();
    };

    [header].forEach(el => {
        if (!el) return;
        el.addEventListener('wheel', forwardWheel, { passive: false });
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

function initAnalytics() {
    const rangeSelect = document.getElementById('analytics-range');
    if (!rangeSelect) return;
    rangeSelect.addEventListener('change', renderAnalytics);

    const granularitySelect = document.getElementById('analytics-revenue-granularity');
    if (granularitySelect) {
        const saved = localStorage.getItem('analyticsRevenueGranularity');
        if (saved) granularitySelect.value = saved;
        granularitySelect.addEventListener('change', function() {
            localStorage.setItem('analyticsRevenueGranularity', this.value);
            renderAnalytics();
        });
    }
    window.addEventListener('storage', function(e) {
        if (!e) return;
        if (e.key === 'orders' || e.key === 'analyticsEvents' || e.key === 'analytics_events') renderAnalytics();
    });
    window.addEventListener('ordersUpdated', function() {
        renderAnalytics();
    });
    renderAnalytics();
}

function getOrdersByRange(range, allOrders) {
    if (range === 'all') return allOrders;
    const now = new Date();
    let start = new Date(0);
    if (range === 'day') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'week') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
    } else if (range === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (range === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
    }
    return allOrders.filter(order => {
        const d = order.createdAt ? new Date(order.createdAt) : new Date();
        return d >= start && d <= now;
    });
}

function getRangeLabel(range) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('vi-VN');
    if (range === 'day') {
        return 'Hôm nay (' + formatter.format(now) + ')';
    }
    if (range === 'week') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        return '7 ngày gần đây (' + formatter.format(start) + ' - ' + formatter.format(now) + ')';
    }
    if (range === 'month') {
        return 'Tháng này (' + (now.getMonth() + 1) + '/' + now.getFullYear() + ')';
    }
    if (range === 'year') {
        return 'Năm ' + now.getFullYear();
    }
    return 'Tất cả thời gian';
}

let analyticsRevenueChart = null;
let analyticsTrafficChart = null;
let analyticsOrdersSourceChart = null;
let analyticsFunnelChart = null;

function formatCurrencyVnd(value) {
    const n = parseInt(value) || 0;
    return n.toLocaleString('vi-VN') + ' ₫';
}

function getOrderDate(order) {
    const d = order && order.createdAt ? new Date(order.createdAt) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
}

function getOrderCustomerName(order) {
    return order?.deliveryInfo?.fullname || order?.customerName || 'N/A';
}

function getPeriodMeta(range) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start = new Date(0);
    let prevStart = new Date(0);
    let prevEnd = new Date(0);
    let prevLabel = 'kỳ trước';

    if (range === 'day') {
        start = startOfDay;
        prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        prevEnd = startOfDay;
        prevLabel = 'hôm qua';
    } else if (range === 'week') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 13);
        prevEnd = start;
        prevLabel = '7 ngày trước';
    } else if (range === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = start;
        prevLabel = 'tháng trước';
    } else if (range === 'year') {
        start = new Date(now.getFullYear(), 0, 1);
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = start;
        prevLabel = 'năm trước';
    } else {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEnd = start;
        prevLabel = 'tháng trước';
    }

    return { now, start, prevStart, prevEnd, prevLabel };
}

function filterByPeriod(items, dateGetter, start, end) {
    const startTs = start.getTime();
    const endTs = end.getTime();
    return (items || []).filter(it => {
        const d = dateGetter(it);
        const ts = d.getTime();
        return ts >= startTs && ts < endTs;
    });
}

function sumOrderRevenue(orders) {
    return (orders || []).reduce((sum, o) => sum + (parseInt(o.total) || 0), 0);
}

function getAnalyticsEvents() {
    const rawTable = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const rawLegacy = JSON.parse(localStorage.getItem('analyticsEvents') || '[]');
    const source = Array.isArray(rawTable) && rawTable.length ? rawTable : (Array.isArray(rawLegacy) ? rawLegacy : []);
    return source
        .filter(e => e && typeof e === 'object')
        .map(e => {
            const eventName = e.event_name || e.type || '';
            const createdAt = e.created_at || e.ts || '';
            const sessionId = e.session_id || e.sessionId || '';
            return {
                ...e,
                event_name: String(eventName || '').trim(),
                type: String(eventName || '').trim(),
                created_at: createdAt,
                ts: createdAt,
                session_id: sessionId,
                sessionId: sessionId
            };
        })
        .filter(e => e.event_name && e.created_at);
}

function getEventDate(ev) {
    const d = ev && (ev.created_at || ev.ts) ? new Date(ev.created_at || ev.ts) : new Date(0);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

function getRangeWindow(range) {
    const now = new Date();
    if (range === 'all') return { start: new Date(0), end: new Date(now.getTime() + 1) };
    if (range === 'day') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return { start, end: new Date(now.getTime() + 1) };
    }
    if (range === 'week') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
        return { start, end: new Date(now.getTime() + 1) };
    }
    if (range === 'month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        return { start, end: new Date(now.getTime() + 1) };
    }
    if (range === 'year') {
        const start = new Date(now.getFullYear(), 0, 1);
        return { start, end: new Date(now.getTime() + 1) };
    }
    return { start: new Date(0), end: new Date(now.getTime() + 1) };
}

function getSourcesList() {
    return ['direct', 'google', 'facebook', 'seo', 'affiliate', 'email', 'others'];
}

function normalizeSource(src) {
    const s = String(src || '').toLowerCase().trim();
    const allowed = new Set(getSourcesList());
    if (allowed.has(s)) return s;
    if (!s) return 'direct';
    return 'others';
}

function getSourceLabel(src) {
    const map = {
        direct: 'direct',
        google: 'google',
        facebook: 'facebook',
        seo: 'seo',
        affiliate: 'affiliate',
        email: 'email',
        others: 'others'
    };
    return map[src] || src;
}

function getSourceColors() {
    return [
        '#6a5af9',
        '#22c55e',
        '#1877f2',
        '#f59e0b',
        '#a855f7',
        '#06b6d4',
        '#94a3b8'
    ];
}

function renderPieChart(canvasId, chartRefGetter, chartRefSetter, labels, values, title) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    const prev = chartRefGetter();
    if (prev) {
        prev.destroy();
        chartRefSetter(null);
    }

    const colors = getSourceColors();
    const chart = new Chart(canvas, {
        type: 'pie',
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                title: title ? { display: false, text: title } : { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = parseInt(ctx.raw) || 0;
                            const total = (ctx.dataset.data || []).reduce((s, n) => s + (parseInt(n) || 0), 0);
                            const pct = total ? Math.round((v / total) * 100) : 0;
                            return `${ctx.label}: ${v} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
    chartRefSetter(chart);
}

function renderDoughnutChart(canvasId, chartRefGetter, chartRefSetter, labels, values) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    const prev = chartRefGetter();
    if (prev) {
        prev.destroy();
        chartRefSetter(null);
    }

    const colors = ['#6a5af9', '#22c55e', '#f59e0b'];
    const chart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [
                {
                    data: values,
                    backgroundColor: labels.map((_, i) => colors[i % colors.length]),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = parseInt(ctx.raw) || 0;
                            const total = (ctx.dataset.data || []).reduce((s, n) => s + (parseInt(n) || 0), 0);
                            const pct = total ? Math.round((v / total) * 100) : 0;
                            return `${ctx.label}: ${v} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
    chartRefSetter(chart);
}

function renderBarChart(canvasId, chartRefGetter, chartRefSetter, labels, datasets, tooltipType) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    const prev = chartRefGetter();
    if (prev) {
        prev.destroy();
        chartRefSetter(null);
    }

    const chart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: ctx => {
                            const v = parseInt(ctx.raw) || 0;
                            if (tooltipType === 'currency') return `${ctx.dataset.label}: ${formatCurrencyVnd(v)}`;
                            return `${ctx.dataset.label}: ${v}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(148, 163, 184, 0.25)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
    chartRefSetter(chart);
}

function renderTrafficChart(range) {
    const events = getAnalyticsEvents();
    const { start, end } = getRangeWindow(range);
    const inRange = filterByPeriod(events, getEventDate, start, end);
    const pv = inRange.filter(e => e.event_name === 'page_view' || e.type === 'page_view');
    const byPage = new Map();
    pv.forEach(e => {
        const page = String(e.page || e.path || e.url || e.pathname || '').trim() || '(unknown)';
        const sessionId = String(e.session_id || e.sessionId || '').trim() || '(unknown)';
        if (!byPage.has(page)) byPage.set(page, { pageViews: 0, sessions: new Set() });
        const row = byPage.get(page);
        row.pageViews += 1;
        row.sessions.add(sessionId);
    });

    const rows = Array.from(byPage.entries())
        .map(([page, v]) => ({ page, pageViews: v.pageViews, sessions: v.sessions.size }))
        .sort((a, b) => b.pageViews - a.pageViews);
    const top = rows.slice(0, 8);

    const labels = top.map(r => r.page);
    const datasets = [
        {
            label: 'Sessions',
            data: top.map(r => r.sessions),
            backgroundColor: 'rgba(34, 197, 94, 0.55)',
            borderColor: '#22c55e',
            borderWidth: 1,
            borderRadius: 8
        },
        {
            label: 'Page Views',
            data: top.map(r => r.pageViews),
            backgroundColor: 'rgba(106, 90, 249, 0.55)',
            borderColor: '#6a5af9',
            borderWidth: 1,
            borderRadius: 8
        }
    ];

    renderBarChart(
        'analytics-traffic-chart',
        () => analyticsTrafficChart,
        v => (analyticsTrafficChart = v),
        labels,
        datasets
    );
}

function renderConfirmedOrdersSourceChart(range, ordersAll) {
    const ordersRaw = Array.isArray(ordersAll) ? ordersAll : [];
    const { start, end } = getRangeWindow(range);
    const inRange = filterByPeriod(ordersRaw, getOrderDate, start, end);

    const getPaymentType = o => {
        const t = String(o && o.paymentType ? o.paymentType : '').toLowerCase();
        if (t === 'online' || t === 'cod') return t;
        const m = String(o && o.paymentMethod ? o.paymentMethod : '').toLowerCase();
        return m === 'cod' ? 'cod' : 'online';
    };
    const getPaymentLabel = o => {
        const paymentType = getPaymentType(o);
        if (paymentType === 'cod') return 'COD';
        const method = String(o && o.paymentMethod ? o.paymentMethod : '').toLowerCase();
        const map = {
            'online_momo': 'Ví Momo',
            'online_bank': 'Chuyển Khoản Ngân Hàng',
            'online_visa': 'Thẻ Visa/MasterCard'
        };
        if (o && o.paymentMethodName && o.paymentMethodName !== 'Thanh toán khi nhận hàng') return String(o.paymentMethodName);
        return map[method] || 'Online';
    };

    const eligible = inRange.filter(o => {
        const status = String(o && o.status ? o.status : '').toLowerCase();
        const paymentType = getPaymentType(o);
        if (status === 'cancelled') return false;
        if (paymentType === 'online') return true;
        return paymentType === 'cod' && status === 'delivered';
    });

    const orderLabels = ['COD', 'Ví Momo', 'ZaloPay', 'Chuyển Khoản Ngân Hàng', 'Thẻ Visa/MasterCard', 'Online'];
    const countsMap = {};
    eligible.forEach(o => {
        const label = getPaymentLabel(o);
        countsMap[label] = (countsMap[label] || 0) + 1;
    });
    const dynamic = Object.keys(countsMap).filter(l => !orderLabels.includes(l)).sort((a, b) => a.localeCompare(b, 'vi'));
    const labels = orderLabels.concat(dynamic).filter(l => (countsMap[l] || 0) > 0);
    const counts = labels.map(l => countsMap[l] || 0);
    renderPieChart(
        'analytics-orders-source-chart',
        () => analyticsOrdersSourceChart,
        v => (analyticsOrdersSourceChart = v),
        labels,
        counts,
        'Total Confirmed Orders per Source'
    );
}

function renderCustomerFunnelChart(range) {
    const events = getAnalyticsEvents();
    const { start, end } = getRangeWindow(range);
    const inRange = filterByPeriod(events, getEventDate, start, end);
    const viewsCount = inRange.filter(e => e.event_name === 'view' || e.type === 'view').length;
    const addsCount = inRange.filter(e => e.event_name === 'add_to_cart' || e.type === 'add_to_cart').length;
    const checkoutsCount = inRange.filter(e => e.event_name === 'checkout' || e.type === 'checkout').length;
    const labels = ['view', 'add_to_cart', 'checkout'];
    const values = [viewsCount, addsCount, checkoutsCount];
    renderDoughnutChart(
        'analytics-funnel-chart',
        () => analyticsFunnelChart,
        v => (analyticsFunnelChart = v),
        labels,
        values
    );
}

function sumItemsSold(orders) {
    return (orders || []).reduce((sum, o) => {
        const items = o.items || [];
        return sum + items.reduce((s, it) => s + (parseInt(it.quantity) || 0), 0);
    }, 0);
}

function buildTrendText(currValue, prevValue, label) {
    if (!prevValue && !currValue) return { text: '—', sign: 'neutral' };
    if (!prevValue && currValue) return { text: '+100% so với ' + label, sign: 'positive' };
    const pct = ((currValue - prevValue) / prevValue) * 100;
    const rounded = Math.round(pct);
    return { text: (rounded >= 0 ? '+' : '') + rounded + '% so với ' + label, sign: rounded >= 0 ? 'positive' : 'negative' };
}

function setTrendElement(el, trend) {
    if (!el) return;
    el.textContent = trend.text;
    el.classList.remove('positive', 'negative');
    if (trend.sign === 'positive') el.classList.add('positive');
    if (trend.sign === 'negative') el.classList.add('negative');
}

function buildRevenueSeries(granularity, ordersAll) {
    const now = new Date();
    const orders = Array.isArray(ordersAll) ? ordersAll : [];
    const points = [];

    if (!orders.length) {
        return { labels: [], values: [] };
    }

    if (granularity === '12h') {
        const endHour = new Date(now.getTime());
        endHour.setMinutes(0, 0, 0);
        const startHour = new Date(endHour.getTime() - 11 * 3600000);
        for (let i = 0; i < 12; i++) {
            const s = new Date(startHour.getTime() + i * 3600000);
            const e = new Date(startHour.getTime() + (i + 1) * 3600000);
            points.push({ label: String(s.getHours()).padStart(2, '0') + ':00', start: s, end: e });
        }
    } else if (granularity === 'day') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const days = Math.round((endMonth.getTime() - start.getTime()) / 86400000);
        for (let i = 0; i < days; i++) {
            const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
            points.push({ label: String(d.getDate()), start: d, end: new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1) });
        }
    } else if (granularity === 'month') {
        for (let m = 0; m < 12; m++) {
            const start = new Date(now.getFullYear(), m, 1);
            const end = new Date(now.getFullYear(), m + 1, 1);
            const label = 'T' + String(m + 1);
            points.push({ label, start, end });
        }
    } else if (granularity === 'year') {
        const years = Array.from(new Set(orders.map(o => getOrderDate(o).getFullYear()))).sort((a, b) => a - b);
        const list = years.length ? years : [now.getFullYear()];
        const slice = list.length > 8 ? list.slice(list.length - 8) : list;
        slice.forEach(y => {
            const start = new Date(y, 0, 1);
            const end = new Date(y + 1, 0, 1);
            points.push({ label: String(y), start, end });
        });
    } else {
        for (let i = 11; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
            const label = start.toLocaleDateString('vi-VN', { month: 'short' });
            points.push({ label, start, end });
        }
    }

    const labels = points.map(p => p.label);
    const values = points.map(p => {
        const periodOrders = filterByPeriod(orders, getOrderDate, p.start, p.end);
        return sumOrderRevenue(periodOrders);
    });

    return { labels, values };
}

function renderRevenueChart(granularity, ordersAll) {
    const canvas = document.getElementById('analytics-revenue-chart');
    if (!canvas) return;
    if (typeof Chart === 'undefined') return;

    const { labels, values } = buildRevenueSeries(granularity, ordersAll);

    if (analyticsRevenueChart) {
        analyticsRevenueChart.destroy();
        analyticsRevenueChart = null;
    }

    analyticsRevenueChart = new Chart(canvas, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Doanh thu',
                    data: values,
                    borderColor: '#6a5af9',
                    backgroundColor: 'rgba(106, 90, 249, 0.16)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 3,
                    pointHoverRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => formatCurrencyVnd(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: value => {
                            const n = parseInt(value) || 0;
                            if (n >= 1000000) return (n / 1000000).toFixed(0) + 'M';
                            if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
                            return n.toString();
                        }
                    },
                    grid: { color: 'rgba(148, 163, 184, 0.25)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function renderRecentOrders(ordersAll) {
    const tbody = document.getElementById('analytics-recent-orders-body');
    if (!tbody) return;
    const orders = (ordersAll && ordersAll.length) ? ordersAll.slice() : [];
    orders.sort((a, b) => getOrderDate(b).getTime() - getOrderDate(a).getTime());
    const recent = orders.slice(0, 5);
    tbody.innerHTML = '';

    if (!recent.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center">Chưa có đơn hàng</td></tr>`;
        return;
    }

    recent.forEach(o => {
        const tr = document.createElement('tr');
        const code = 'ORD' + String(o.id);
        tr.innerHTML = `
            <td>#${code}</td>
            <td>${getOrderCustomerName(o)}</td>
            <td>${formatCurrencyVnd(o.total)}</td>
            <td><span class="status-badge status-${o.status}">${getOrderStatusText(o.status)}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderTopProducts(ordersInRange) {
    const tbody = document.getElementById('analytics-top-products-body');
    if (!tbody) return;
    const orders = (ordersInRange && ordersInRange.length) ? ordersInRange : [];
    const map = {};
    orders.forEach(o => {
        (o.items || []).forEach(it => {
            const name = it.name || it.title || 'Sản phẩm';
            if (!map[name]) map[name] = { name, sold: 0, revenue: 0 };
            const qty = parseInt(it.quantity) || 0;
            const price = parseInt(it.price) || 0;
            map[name].sold += qty;
            map[name].revenue += qty * price;
        });
    });
    const list = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    tbody.innerHTML = '';
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center">Chưa có dữ liệu bán hàng</td></tr>`;
        return;
    }
    list.forEach(p => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.name}</td>
            <td>${p.sold}</td>
            <td>${formatCurrencyVnd(p.revenue)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAnalytics() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const ordersAll = JSON.parse(localStorage.getItem('orders')) || [];
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    const rangeSelect = document.getElementById('analytics-range');
    const range = rangeSelect ? rangeSelect.value : 'all';
    const orders = getOrdersByRange(range, ordersAll);
    
    const rangeLabelEl = document.getElementById('analytics-range-label');
    if (rangeLabelEl) {
        rangeLabelEl.textContent = getRangeLabel(range);
    }
    
    const categoryNames = { ao: 'Áo', quan: 'Quần', giay: 'Giày', non: 'Nón', phukien: 'Phụ kiện' };
    const categories = ['ao', 'quan', 'giay', 'non', 'phukien'];
    
    const stats = {};
    categories.forEach(cat => {
        stats[cat] = {
            key: cat,
            name: categoryNames[cat],
            remaining: 0,
            sold: 0,
            orders: 0,
            revenue: 0
        };
    });
    
    products.forEach(p => {
        if (stats[p.category]) {
            stats[p.category].remaining += parseInt(p.quantity) || 0;
        }
    });
    
    // Tính doanh số theo danh mục dựa trên các đơn hàng
    orders.forEach(order => {
        const seenInOrder = {};
        (order.items || []).forEach(item => {
            const cat = item.category;
            if (!stats[cat]) return;
            const qty = parseInt(item.quantity) || 0;
            const price = parseInt(item.price) || 0;
            stats[cat].sold += qty;
            stats[cat].revenue += qty * price;
            if (!seenInOrder[cat]) {
                stats[cat].orders += 1;
                seenInOrder[cat] = true;
            }
        });
    });
    
    const totalRevenue = orders.reduce((sum, o) => sum + (parseInt(o.total) || 0), 0);
    const totalOrders = orders.length;
    const totalItemsSold = Object.values(stats).reduce((sum, s) => sum + s.sold, 0);
    const avgOrder = totalOrders ? Math.round(totalRevenue / totalOrders) : 0;
    
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.role === 'admin').length;
    const staffProductsCount = users.filter(u => u.role === 'staff_products').length;
    const staffOrdersCount = users.filter(u => u.role === 'staff_orders').length;
    const cashierCount = users.filter(u => u.role === 'cashier').length;
    const staffMarketingCount = users.filter(u => u.role === 'staff_marketing').length;
    const customerCount = users.filter(u => u.role === 'user').length;
    
    const totalRevEl = document.getElementById('analytics-total-revenue');
    const totalOrdersEl = document.getElementById('analytics-total-orders');
    const itemsSoldEl = document.getElementById('analytics-items-sold');
    const avgOrderEl = document.getElementById('analytics-average-order');
    
    if (totalRevEl) totalRevEl.textContent = formatCurrencyVnd(totalRevenue);
    if (totalOrdersEl) totalOrdersEl.textContent = totalOrders + ' đơn hàng';
    if (itemsSoldEl) itemsSoldEl.textContent = totalItemsSold.toString();
    if (avgOrderEl) avgOrderEl.textContent = 'Giá trị đơn trung bình: ' + formatCurrencyVnd(avgOrder);

    const { now, start, prevStart, prevEnd, prevLabel } = getPeriodMeta(range);
    const currOrdersForTrend = filterByPeriod(ordersAll, getOrderDate, start, new Date(now.getTime() + 1));
    const prevOrdersForTrend = filterByPeriod(ordersAll, getOrderDate, prevStart, prevEnd);
    const revenueTrend = buildTrendText(sumOrderRevenue(currOrdersForTrend), sumOrderRevenue(prevOrdersForTrend), prevLabel);
    const itemsTrend = buildTrendText(sumItemsSold(currOrdersForTrend), sumItemsSold(prevOrdersForTrend), prevLabel);
    const currUsers = filterByPeriod(users, u => (u.createdAt ? new Date(u.createdAt) : new Date(0)), start, new Date(now.getTime() + 1)).length;
    const prevUsers = filterByPeriod(users, u => (u.createdAt ? new Date(u.createdAt) : new Date(0)), prevStart, prevEnd).length;
    const usersTrend = buildTrendText(currUsers, prevUsers, prevLabel);

    setTrendElement(document.getElementById('analytics-revenue-trend'), revenueTrend);
    setTrendElement(document.getElementById('analytics-items-trend'), itemsTrend);
    setTrendElement(document.getElementById('analytics-users-trend'), usersTrend);
    
    const usersTotalEl = document.getElementById('analytics-users-total');
    const usersDetailEl = document.getElementById('analytics-users-detail');
    const usersTotal2El = document.getElementById('analytics-users-total-2');
    const adminCountEl = document.getElementById('analytics-admin-count');
    const staffProdEl = document.getElementById('analytics-staff-products-count');
    const staffOrdersEl = document.getElementById('analytics-staff-orders-count');
    const cashierCountEl = document.getElementById('analytics-cashier-count');
    const staffMarketingCountEl = document.getElementById('analytics-staff-marketing-count');
    const customerCountEl = document.getElementById('analytics-customer-count');
    
    if (usersTotalEl) usersTotalEl.textContent = totalUsers.toString();
    if (usersDetailEl) usersDetailEl.textContent =
        adminCount + ' admin • ' +
        (staffProductsCount + staffOrdersCount) + ' nhân viên • ' +
        cashierCount + ' thu ngân • ' +
        staffMarketingCount + ' marketing • ' +
        customerCount + ' khách hàng';
    if (usersTotal2El) usersTotal2El.textContent = totalUsers.toString();
    if (adminCountEl) adminCountEl.textContent = adminCount.toString();
    if (staffProdEl) staffProdEl.textContent = staffProductsCount.toString();
    if (staffOrdersEl) staffOrdersEl.textContent = staffOrdersCount.toString();
    if (cashierCountEl) cashierCountEl.textContent = cashierCount.toString();
    if (staffMarketingCountEl) staffMarketingCountEl.textContent = staffMarketingCount.toString();
    if (customerCountEl) customerCountEl.textContent = customerCount.toString();
    
    const tbody = document.getElementById('analytics-category-body');
    if (!tbody) return;
    tbody.innerHTML = '';
    
    const totalRevenueCategories = Object.values(stats).reduce((sum, s) => sum + s.revenue, 0);
    
    Object.values(stats).forEach(s => {
        const tr = document.createElement('tr');
        const ratio = totalRevenueCategories ? (s.revenue / totalRevenueCategories) * 100 : 0;
        tr.innerHTML = `
            <td>${s.name}</td>
            <td>${s.remaining}</td>
            <td>${s.sold}</td>
            <td>${s.orders}</td>
            <td>${formatCurrencyVnd(s.revenue)}</td>
            <td>
                <div class="revenue-ratio">
                    <div class="revenue-bar">
                        <div class="revenue-fill" style="width:${Math.max(0, Math.min(100, ratio)).toFixed(1)}%"></div>
                    </div>
                    <span>${ratio.toFixed(1)}%</span>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });

    const granularitySelect = document.getElementById('analytics-revenue-granularity');
    const granularity = granularitySelect ? granularitySelect.value : (localStorage.getItem('analyticsRevenueGranularity') || '12h');
    renderRevenueChart(granularity, ordersAll);
    renderRecentOrders(ordersAll);
    renderTopProducts(orders);
    renderTrafficChart(range);
    renderConfirmedOrdersSourceChart(range, ordersAll);
    renderCustomerFunnelChart(range);
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
    
    const canManageProducts = hasPermission('products', 'manage') || canAccessSection('products-management');

    products.forEach(product => {
        const row = document.createElement('tr');
        
        const formattedPrice = product.price.toLocaleString('vi-VN') + ' VNĐ';
        
        const categoryNames = {
            'ao': 'Áo',
            'quan': 'Quần',
            'giay': 'Giày',
            'non': 'Nón',
            'phukien': 'Phụ kiện'
        };
        
        const status = product.status || (product.quantity > 0 ? 'in-stock' : 'out-of-stock');
        const statusText = status === 'out-of-stock' ? 'Hết hàng' : 'Còn hàng';
        
        const displayQuantity = status === 'out-of-stock' ? 0 : product.quantity;
        const mainImage = Array.isArray(product.images) && product.images.length ? product.images[0] : product.image;
        
        const actionButtonsHtml = canManageProducts ? `
                <div class="action-buttons">
                    <button class="btn-edit" data-product-id="${product.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-product-id="${product.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
        ` : '';

        row.innerHTML = `
            <td>${product.id}</td>
            <td class="product-image-cell">
                <img src="${mainImage}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'">
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
                ${actionButtonsHtml}
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
    document.querySelectorAll('.products-table .btn-edit[data-product-id]').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            editProduct(productId);
        });
    });
    
    // Sự kiện xóa
    document.querySelectorAll('.products-table .btn-delete[data-product-id]').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.getAttribute('data-product-id');
            deleteProduct(productId);
        });
    });
}

// Chỉnh sửa sản phẩm
function editProduct(productId) {
    if (!hasPermission('products', 'manage')) {
        showNotification('Bạn không có quyền chỉnh sửa sản phẩm', 'error');
        return;
    }
    // Lấy sản phẩm từ localStorage
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const product = products.find(p => p.id == productId);
    
    if (!product) {
        showNotification('Sản phẩm không tồn tại!', 'error');
        return;
    }
    
    document.getElementById('edit-product-id').value = product.id;
    document.getElementById('edit-product-name').value = product.name;
    document.getElementById('edit-product-category').value = product.category;
    document.getElementById('edit-product-price').value = product.price;
    document.getElementById('edit-product-quantity').value = product.quantity;
    const editDescEditor = document.getElementById('edit-product-description-editor');
    if (editDescEditor) {
        editDescEditor.innerHTML = product.description || '';
    }
    
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

    const modal = document.getElementById('edit-product-modal');
    modal.style.display = 'flex';

    const editDescEditorForToolbar = document.getElementById('edit-product-description-editor');
    let editDescSavedRange = null;
    let detachEditorSelectionTracking = null;
    if (editDescEditorForToolbar) {
        const saveSelection = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const r = sel.getRangeAt(0);
            if (!editDescEditorForToolbar.contains(r.commonAncestorContainer)) return;
            editDescSavedRange = r.cloneRange();
        };
        editDescEditorForToolbar.onmouseup = saveSelection;
        editDescEditorForToolbar.onkeyup = saveSelection;
        editDescEditorForToolbar.ontouchend = saveSelection;

        const onSelectionChange = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const r = sel.getRangeAt(0);
            if (!editDescEditorForToolbar.contains(r.commonAncestorContainer)) return;
            editDescSavedRange = r.cloneRange();
        };
        document.addEventListener('selectionchange', onSelectionChange);
        detachEditorSelectionTracking = () => document.removeEventListener('selectionchange', onSelectionChange);
    }

    const focusEditorFromToolbar = el => {
        const toolbar = el.closest('.editor-toolbar');
        const editorId = toolbar ? toolbar.getAttribute('data-editor') : null;
        const editor = editorId ? document.getElementById(editorId) : null;
        if (editor) editor.focus();
        return editor;
    };

    const applyInlineStyleAtSelection = (editor, styleString) => {
        if (!editor) return;
        if (editDescSavedRange) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(editDescSavedRange);
            }
        }
        editor.focus();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        if (range.collapsed) {
            const span = document.createElement('span');
            span.setAttribute('style', styleString);
            const text = document.createTextNode('\u200B');
            span.appendChild(text);
            range.insertNode(span);
            const nextRange = document.createRange();
            nextRange.setStart(text, 1);
            nextRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(nextRange);
            editDescSavedRange = nextRange.cloneRange();
            return;
        }
    };

    const normalizeFontTags = editor => {
        if (!editor) return;
        editor.querySelectorAll('font[face]').forEach(node => {
            const face = node.getAttribute('face') || '';
            const span = document.createElement('span');
            if (face) span.style.fontFamily = face;
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
    };

    const applyFontFamily = (editor, font) => {
        if (!font) return;
        if (editDescSavedRange) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(editDescSavedRange);
            }
        }
        const selection = window.getSelection();
        const hasSelection = selection && selection.rangeCount && !selection.getRangeAt(0).collapsed;
        if (hasSelection) {
            editor.focus();
            document.execCommand('fontName', false, font);
            normalizeFontTags(editor);
            const sel = window.getSelection();
            if (sel && sel.rangeCount) editDescSavedRange = sel.getRangeAt(0).cloneRange();
            return;
        }
        applyInlineStyleAtSelection(editor, `font-family:${font};`);
    };

    const stripFontSizeStyles = root => {
        if (!root) return;
        root.querySelectorAll('[style]').forEach(el => {
            if (!el.style) return;
            if (el.style.fontSize) {
                el.style.fontSize = '';
                if (!el.getAttribute('style')) el.removeAttribute('style');
            }
        });
        root.querySelectorAll('font[size]').forEach(node => {
            const span = document.createElement('span');
            const face = node.getAttribute('face');
            const color = node.getAttribute('color');
            if (face) span.style.fontFamily = face;
            if (color) span.style.color = color;
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
    };

    const applyFontSizePx = (editor, px) => {
        if (!px) return;
        if (!editor) return;
        if (editDescSavedRange) {
            const sel = window.getSelection();
            if (sel) {
                sel.removeAllRanges();
                sel.addRange(editDescSavedRange);
            }
        }
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;
        editor.focus();
        if (range.collapsed) {
            applyInlineStyleAtSelection(editor, `font-size:${px}px;`);
            return;
        }

        const extracted = range.extractContents();
        const wrapper = document.createElement('span');
        wrapper.style.fontSize = `${px}px`;
        wrapper.appendChild(extracted);
        stripFontSizeStyles(wrapper);
        range.insertNode(wrapper);

        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
        editDescSavedRange = newRange.cloneRange();
    };

    modal.querySelectorAll('.editor-toolbar button[data-cmd]').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            const cmd = this.getAttribute('data-cmd');
            if (!cmd) return;
            const editor = focusEditorFromToolbar(this);
            document.execCommand(cmd, false, null);
            normalizeFontTags(editor);
        };
    });

    modal.querySelectorAll('.editor-toolbar select[data-cmd]').forEach(sel => {
        sel.onchange = function() {
            const cmd = this.getAttribute('data-cmd');
            const editor = focusEditorFromToolbar(this) || editDescEditorForToolbar;
            if (cmd === 'fontName') {
                applyFontFamily(editor, this.value);
            }
        };
    });

    const fontSizeInput = modal.querySelector('.editor-fontsize-input');
    const applyFontSizeFromControl = nextValue => {
        const n = parseInt(nextValue, 10);
        if (Number.isNaN(n)) return;
        const clamped = Math.max(1, Math.min(72, n));
        if (fontSizeInput) fontSizeInput.value = String(clamped);
        applyFontSizePx(editDescEditorForToolbar, clamped);
    };

    const bumpFontSize = delta => {
        const current = fontSizeInput ? parseInt(fontSizeInput.value, 10) : 14;
        const base = Number.isNaN(current) ? 14 : current;
        applyFontSizeFromControl(base + delta);
    };

    const fontSizeButtons = modal.querySelectorAll('.editor-fontsize-btn[data-action]');
    fontSizeButtons.forEach(btn => {
        btn.onmousedown = e => {
            e.preventDefault();
        };
        btn.onclick = e => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            if (action === 'inc') bumpFontSize(1);
            if (action === 'dec') bumpFontSize(-1);
        };
    });

    if (fontSizeInput) {
        fontSizeInput.onmousedown = e => {
            e.stopPropagation();
        };
        fontSizeInput.onkeydown = e => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                bumpFontSize(1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                bumpFontSize(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                applyFontSizeFromControl(fontSizeInput.value);
            }
        };
        fontSizeInput.onchange = () => applyFontSizeFromControl(fontSizeInput.value);
        fontSizeInput.onblur = () => applyFontSizeFromControl(fontSizeInput.value);
    }

    const editImagePreview = document.getElementById('edit-image-preview');
    const editImageGrid = document.getElementById('edit-image-preview-grid');
    const editImageInput = document.getElementById('edit-product-image');
    const editUploadBtn = document.getElementById('edit-upload-btn');

    const originalImages = Array.isArray(product.images) && product.images.length
        ? product.images.slice()
        : (product.image ? [product.image] : []);

    const imageItems = originalImages.map(src => ({ kind: 'existing', src }));
    const objectUrls = new Set();

    const fileToDataUrl = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('read_failed'));
        reader.readAsDataURL(file);
    });

    const renderImages = () => {
        if (!editImagePreview || !editImageGrid) return;
        const placeholder = editImagePreview.querySelector('.dropzone-placeholder');
        editImageGrid.innerHTML = '';
        if (placeholder) {
            placeholder.style.display = imageItems.length ? 'none' : '';
        }
        imageItems.forEach((it, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'preview-item';
            const img = document.createElement('img');
            img.src = it.kind === 'existing' ? it.src : it.previewUrl;
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'preview-delete-btn';
            del.innerHTML = '&times;';
            del.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                const removed = imageItems.splice(idx, 1)[0];
                if (removed && removed.kind === 'file' && removed.previewUrl) {
                    URL.revokeObjectURL(removed.previewUrl);
                    objectUrls.delete(removed.previewUrl);
                }
                renderImages();
            };
            wrap.appendChild(img);
            wrap.appendChild(del);
            editImageGrid.appendChild(wrap);
        });
    };

    const addFiles = files => {
        const list = Array.isArray(files) ? files : [];
        list.forEach(file => {
            if (!file || !file.type || !file.type.startsWith('image/')) return;
            const url = URL.createObjectURL(file);
            objectUrls.add(url);
            imageItems.push({ kind: 'file', file, previewUrl: url });
        });
        renderImages();
    };

    const cleanupObjectUrls = () => {
        objectUrls.forEach(url => URL.revokeObjectURL(url));
        objectUrls.clear();
    };

    const openFilePicker = () => {
        if (editImageInput) editImageInput.click();
    };

    if (editUploadBtn) editUploadBtn.onclick = openFilePicker;

    if (editImageInput) {
        editImageInput.onchange = function() {
            const files = this.files ? Array.from(this.files) : [];
            if (!files.length) return;
            addFiles(files);
            this.value = '';
        };
    }

    if (editImagePreview) {
        editImagePreview.onclick = e => {
            if (e.target.closest('.preview-delete-btn')) return;
            openFilePicker();
        };
        editImagePreview.ondragover = e => {
            e.preventDefault();
            editImagePreview.classList.add('dragover');
        };
        editImagePreview.ondragleave = e => {
            e.preventDefault();
            editImagePreview.classList.remove('dragover');
        };
        editImagePreview.ondrop = e => {
            e.preventDefault();
            editImagePreview.classList.remove('dragover');
            const files = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
            if (!files.length) return;
            addFiles(files);
        };
        editImagePreview.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
            }
        };
    }

    renderImages();
    
    // Thêm sự kiện đóng modal
    const closeButtons = modal.querySelectorAll('.close-modal');
    const closeModal = () => {
        modal.style.display = 'none';
        cleanupObjectUrls();
        if (detachEditorSelectionTracking) detachEditorSelectionTracking();
    };
    closeButtons.forEach(button => {
        button.onclick = closeModal;
    });
    
    // Đóng modal khi click ra ngoài
    modal.onclick = function(e) {
        if (e.target === modal) closeModal();
    };
    
    // Xử lý form chỉnh sửa
    const editForm = document.getElementById('edit-product-form');
    editForm.onsubmit = async function(e) {
        e.preventDefault();

        const sizeContainer = document.getElementById('edit-product-sizes');
        let sizes = [];
        if (sizeContainer) {
            sizes = Array.from(sizeContainer.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        }
        const editDescEditorSubmit = document.getElementById('edit-product-description-editor');
        const updatedDescription = editDescEditorSubmit ? editDescEditorSubmit.innerHTML.trim() : product.description;
        
        let finalImages = [];
        try {
            finalImages = await Promise.all(imageItems.map(it => {
                if (it.kind === 'existing') return Promise.resolve(it.src);
                return fileToDataUrl(it.file);
            }));
        } catch (err) {
            showNotification('Không thể đọc hình ảnh. Vui lòng thử lại.', 'error');
            return;
        }
        const mainImage = finalImages && finalImages.length ? finalImages[0] : product.image;

        const updatedProduct = {
            id: parseInt(document.getElementById('edit-product-id').value),
            name: document.getElementById('edit-product-name').value,
            category: document.getElementById('edit-product-category').value,
            price: parseInt(document.getElementById('edit-product-price').value),
            quantity: parseInt(document.getElementById('edit-product-quantity').value),
            description: updatedDescription,
            status: document.getElementById('edit-product-status').value,
            image: mainImage,
            images: finalImages,
            createdAt: product.createdAt,
            sizes: sizes.length ? sizes : undefined
        };

        const productIndex = products.findIndex(p => p.id == updatedProduct.id);
        if (productIndex !== -1) {
            products[productIndex] = updatedProduct;
            localStorage.setItem('products', JSON.stringify(products));
            window.dispatchEvent(new Event('productsUpdated'));
            displayProductsTable(products);
            loadDashboardData();
            closeModal();
            showNotification('Cập nhật sản phẩm thành công!', 'success');
        }
    };
}

// Xóa sản phẩm
function deleteProduct(productId) {
    if (!hasPermission('products', 'manage')) {
        showNotification('Bạn không có quyền xóa sản phẩm', 'error');
        return;
    }
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
    const imageGrid = document.getElementById('add-image-preview-grid');
    const resetBtn = document.getElementById('reset-add-product-btn');
    const descEditor = document.getElementById('product-description-editor');
    
    if (!form) return;
    if (!hasPermission('products', 'manage')) return;

    const nameInput = document.getElementById('product-name');
    const categorySelect = document.getElementById('product-category');
    const priceInput = document.getElementById('product-price');
    const quantityInput = document.getElementById('product-quantity');

    const nameErr = document.getElementById('error-product-name');
    const categoryErr = document.getElementById('error-product-category');
    const priceErr = document.getElementById('error-product-price');
    const quantityErr = document.getElementById('error-product-quantity');
    const descErr = document.getElementById('error-product-description');
    const imagesErr = document.getElementById('error-product-images');

    const setFieldError = (el, errEl, message) => {
        if (errEl) errEl.textContent = message || '';
        if (!el) return;
        if (message) el.classList.add('is-invalid');
        else el.classList.remove('is-invalid');
    };

    const clearAllErrors = () => {
        setFieldError(nameInput, nameErr, '');
        setFieldError(categorySelect, categoryErr, '');
        setFieldError(priceInput, priceErr, '');
        setFieldError(quantityInput, quantityErr, '');
        if (descErr) descErr.textContent = '';
        if (imagesErr) imagesErr.textContent = '';
    };

    const fileToDataUrl = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('read_failed'));
        reader.readAsDataURL(file);
    });

    let imageItems = [];
    const objectUrls = new Set();

    const cleanupObjectUrls = () => {
        objectUrls.forEach(url => URL.revokeObjectURL(url));
        objectUrls.clear();
    };

    const renderImages = () => {
        if (!imagePreview || !imageGrid) return;
        const placeholder = imagePreview.querySelector('.dropzone-placeholder');
        imageGrid.innerHTML = '';
        if (placeholder) placeholder.style.display = imageItems.length ? 'none' : '';
        imageItems.forEach((it, idx) => {
            const wrap = document.createElement('div');
            wrap.className = 'preview-item';
            const img = document.createElement('img');
            img.src = it.previewUrl;
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'preview-delete-btn';
            del.innerHTML = '&times;';
            del.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                const removed = imageItems.splice(idx, 1)[0];
                if (removed && removed.previewUrl) {
                    URL.revokeObjectURL(removed.previewUrl);
                    objectUrls.delete(removed.previewUrl);
                }
                renderImages();
            };
            wrap.appendChild(img);
            wrap.appendChild(del);
            imageGrid.appendChild(wrap);
        });
    };

    const addFiles = files => {
        const list = Array.isArray(files) ? files : [];
        list.forEach(file => {
            if (!file || !file.type || !file.type.startsWith('image/')) return;
            if (imageItems.length >= 8) return;
            const url = URL.createObjectURL(file);
            objectUrls.add(url);
            imageItems.push({ file, previewUrl: url });
        });
        renderImages();
    };

    const openFilePicker = () => {
        if (imageInput) imageInput.click();
    };

    if (uploadBtn) uploadBtn.onclick = openFilePicker;

    if (imageInput) {
        imageInput.onchange = function() {
            const files = this.files ? Array.from(this.files) : [];
            if (!files.length) return;
            addFiles(files);
            this.value = '';
        };
    }

    if (imagePreview) {
        imagePreview.onclick = e => {
            if (e.target.closest('.preview-delete-btn')) return;
            openFilePicker();
        };
        imagePreview.ondragover = e => {
            e.preventDefault();
            imagePreview.classList.add('dragover');
        };
        imagePreview.ondragleave = e => {
            e.preventDefault();
            imagePreview.classList.remove('dragover');
        };
        imagePreview.ondrop = e => {
            e.preventDefault();
            imagePreview.classList.remove('dragover');
            const files = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
            if (!files.length) return;
            addFiles(files);
        };
        imagePreview.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
            }
        };
    }

    let savedRange = null;
    if (descEditor) {
        const saveSelection = () => {
            const sel = window.getSelection();
            if (!sel || sel.rangeCount === 0) return;
            const r = sel.getRangeAt(0);
            if (!descEditor.contains(r.commonAncestorContainer)) return;
            savedRange = r.cloneRange();
        };
        descEditor.onmouseup = saveSelection;
        descEditor.onkeyup = saveSelection;
        descEditor.ontouchend = saveSelection;
        document.addEventListener('selectionchange', saveSelection);
    }

    const ensureSelection = () => {
        if (!descEditor) return;
        descEditor.focus();
        const sel = window.getSelection();
        if (!sel) return;
        if (savedRange) {
            sel.removeAllRanges();
            sel.addRange(savedRange);
            return;
        }
        const range = document.createRange();
        range.selectNodeContents(descEditor);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRange = range.cloneRange();
    };

    const stripFontSizeStyles = root => {
        if (!root) return;
        root.querySelectorAll('[style]').forEach(el => {
            if (!el.style) return;
            if (el.style.fontSize) {
                el.style.fontSize = '';
                if (!el.getAttribute('style')) el.removeAttribute('style');
            }
        });
        root.querySelectorAll('font[size]').forEach(node => {
            const span = document.createElement('span');
            const face = node.getAttribute('face');
            const color = node.getAttribute('color');
            if (face) span.style.fontFamily = face;
            if (color) span.style.color = color;
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
    };

    const stripFontFamilyStyles = root => {
        if (!root) return;
        root.querySelectorAll('[style]').forEach(el => {
            if (!el.style) return;
            if (el.style.fontFamily) {
                el.style.fontFamily = '';
                if (!el.getAttribute('style')) el.removeAttribute('style');
            }
        });
        root.querySelectorAll('font[face]').forEach(node => {
            const span = document.createElement('span');
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
    };

    const applyFontFamily = font => {
        if (!descEditor) return;
        if (!font) return;
        ensureSelection();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!descEditor.contains(range.commonAncestorContainer)) return;

        if (range.collapsed) {
            const span = document.createElement('span');
            span.style.fontFamily = font;
            const text = document.createTextNode('\u200B');
            span.appendChild(text);
            range.insertNode(span);
            const nextRange = document.createRange();
            nextRange.setStart(text, 1);
            nextRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nextRange);
            savedRange = nextRange.cloneRange();
            return;
        }

        const extracted = range.extractContents();
        const wrapper = document.createElement('span');
        wrapper.style.fontFamily = font;
        wrapper.appendChild(extracted);
        stripFontFamilyStyles(wrapper);
        range.insertNode(wrapper);
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRange = newRange.cloneRange();
    };

    const applyFontSizePx = px => {
        if (!descEditor) return;
        const n = parseInt(px, 10);
        if (Number.isNaN(n)) return;
        const size = Math.max(1, Math.min(72, n));
        ensureSelection();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!descEditor.contains(range.commonAncestorContainer)) return;

        if (range.collapsed) {
            const span = document.createElement('span');
            span.style.fontSize = `${size}px`;
            const text = document.createTextNode('\u200B');
            span.appendChild(text);
            range.insertNode(span);
            const nextRange = document.createRange();
            nextRange.setStart(text, 1);
            nextRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nextRange);
            savedRange = nextRange.cloneRange();
            return;
        }

        const extracted = range.extractContents();
        const wrapper = document.createElement('span');
        wrapper.style.fontSize = `${size}px`;
        wrapper.appendChild(extracted);
        stripFontSizeStyles(wrapper);
        range.insertNode(wrapper);
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRange = newRange.cloneRange();
    };

    const editorToolbar = form.querySelectorAll('.editor-toolbar button[data-cmd]');
    editorToolbar.forEach(btn => {
        btn.onmousedown = e => e.preventDefault();
        btn.onclick = function(e) {
            e.preventDefault();
            const cmd = this.getAttribute('data-cmd');
            if (!cmd) return;
            ensureSelection();
            document.execCommand(cmd, false, null);
        };
    });

    const fontFamilySelect = document.getElementById('add-product-fontfamily');
    if (fontFamilySelect) {
        fontFamilySelect.onmousedown = e => e.stopPropagation();
        fontFamilySelect.onchange = function() {
            applyFontFamily(this.value);
        };
    }

    const fontSizeInput = form.querySelector('.editor-fontsize-input');
    const fontSizeButtons = form.querySelectorAll('.editor-fontsize-btn[data-action]');

    const applyFontSizeFromControl = nextValue => {
        const n = parseInt(nextValue, 10);
        if (Number.isNaN(n)) return;
        const clamped = Math.max(1, Math.min(72, n));
        if (fontSizeInput) fontSizeInput.value = String(clamped);
        applyFontSizePx(clamped);
    };

    const bumpFontSize = delta => {
        const current = fontSizeInput ? parseInt(fontSizeInput.value, 10) : 14;
        const base = Number.isNaN(current) ? 14 : current;
        applyFontSizeFromControl(base + delta);
    };

    fontSizeButtons.forEach(btn => {
        btn.onmousedown = e => e.preventDefault();
        btn.onclick = e => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            if (action === 'inc') bumpFontSize(1);
            if (action === 'dec') bumpFontSize(-1);
        };
    });

    if (fontSizeInput) {
        fontSizeInput.onmousedown = e => e.stopPropagation();
        fontSizeInput.onkeydown = e => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                bumpFontSize(1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                bumpFontSize(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                applyFontSizeFromControl(fontSizeInput.value);
            }
        };
        fontSizeInput.onchange = () => applyFontSizeFromControl(fontSizeInput.value);
        fontSizeInput.onblur = () => applyFontSizeFromControl(fontSizeInput.value);
    }

    const resetFormUI = () => {
        clearAllErrors();
        form.reset();
        if (descEditor) descEditor.innerHTML = '';
        cleanupObjectUrls();
        imageItems = [];
        renderImages();
        if (fontSizeInput) fontSizeInput.value = '14';
    };

    if (resetBtn) {
        resetBtn.onclick = e => {
            e.preventDefault();
            resetFormUI();
        };
    }

    renderImages();

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        clearAllErrors();
        
        const productName = (nameInput ? nameInput.value : '').trim();
        const productCategory = categorySelect ? categorySelect.value : '';
        const productPrice = parseInt(priceInput ? priceInput.value : '', 10);
        const productQuantity = parseInt(quantityInput ? quantityInput.value : '', 10);
        const productDescription = descEditor ? descEditor.innerHTML.trim() : '';
        const sizeContainer = document.getElementById('product-sizes');
        let sizes = [];
        if (sizeContainer) {
            sizes = Array.from(sizeContainer.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
        }

        let hasError = false;
        if (!productName) {
            setFieldError(nameInput, nameErr, 'Tên sản phẩm không được trống');
            hasError = true;
        }
        if (!productCategory) {
            setFieldError(categorySelect, categoryErr, 'Vui lòng chọn danh mục');
            hasError = true;
        }
        if (Number.isNaN(productPrice) || productPrice <= 0) {
            setFieldError(priceInput, priceErr, 'Giá phải là số lớn hơn 0');
            hasError = true;
        }
        if (Number.isNaN(productQuantity) || productQuantity < 0) {
            setFieldError(quantityInput, quantityErr, 'Số lượng phải ≥ 0');
            hasError = true;
        }
        const plainDesc = (descEditor ? descEditor.textContent : '').trim();
        if (!plainDesc) {
            if (descErr) descErr.textContent = 'Mô tả sản phẩm không được trống';
            hasError = true;
        }
        if (!imageItems.length) {
            if (imagesErr) imagesErr.textContent = 'Vui lòng chọn ít nhất một hình ảnh sản phẩm';
            hasError = true;
        }
        if (hasError) return;

        let imagesData = [];
        try {
            imagesData = await Promise.all(imageItems.map(it => fileToDataUrl(it.file)));
        } catch (err) {
            showNotification('Không thể đọc hình ảnh. Vui lòng thử lại.', 'error');
            return;
        }
        const mainImage = imagesData[0];
        
        const newProduct = {
            id: generateProductId(),
            name: productName,
            category: productCategory,
            price: productPrice,
            quantity: productQuantity,
            description: productDescription,
            image: mainImage,
            images: imagesData,
            createdAt: new Date().toISOString(),
            sizes: sizes.length ? sizes : undefined
        };
        
        let products = JSON.parse(localStorage.getItem('products')) || [];
        products.push(newProduct);
        localStorage.setItem('products', JSON.stringify(products));
        window.dispatchEvent(new Event('productsUpdated'));
        
        resetFormUI();
        displayProductsTable(products);
        loadDashboardData();
        showNotification('Thêm sản phẩm thành công!', 'success');
        const productsTab = document.querySelector('a[data-section="products-management"]');
        if (productsTab) {
            productsTab.click();
        }
    });
}

const CONTACT_INFO_STORAGE_KEY = 'contactInfo';
const CONTACT_PROVINCES_API_BASE = 'https://provinces.open-api.vn/api';
let contactProvinces = null;
const contactDistrictsByProvince = {};
const contactWardsByDistrict = {};

function getDefaultContactInfo() {
    return {
        store_city: 'Thành phố Hồ Chí Minh',
        store_district: 'Quận 1',
        store_ward: 'Phường Bến Nghé',
        store_address_detail: '123 Đường ABC',
        address: '',
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
    const merged = { ...defaults, ...stored };
    if ((!merged.store_city && !merged.store_district && !merged.store_ward && !merged.store_address_detail) && typeof merged.address === 'string' && merged.address.includes(',')) {
        const parts = merged.address.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length >= 4) {
            merged.store_city = parts[parts.length - 1];
            merged.store_district = parts[parts.length - 2];
            merged.store_ward = parts[parts.length - 3];
            merged.store_address_detail = parts.slice(0, parts.length - 3).join(', ');
        } else if (parts.length === 3) {
            merged.store_city = parts[2];
            merged.store_district = parts[1];
            merged.store_address_detail = parts[0];
        } else if (parts.length === 2) {
            merged.store_city = parts[1];
            merged.store_address_detail = parts[0];
        }
    }
    return merged;
}

function saveContactInfo(next) {
    localStorage.setItem(CONTACT_INFO_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event('contactInfoUpdated'));
}

async function contactFetchJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error('Request failed: ' + res.status);
    }
    return res.json();
}

function formatAddressParts(detail, ward, district, city) {
    const safe = v => (v || '').trim();
    return [safe(detail), safe(ward), safe(district), safe(city)].filter(Boolean).join(', ');
}

function initContactManagement() {
    const form = document.getElementById('contact-info-form');
    const resetBtn = document.getElementById('contact-reset-btn');
    if (!form) return;
    if (!hasPermission('contact', 'manage') && !canAccessSection('contact-management')) return;

    const citySelect = document.getElementById('contact-city');
    const districtSelect = document.getElementById('contact-district');
    const wardSelect = document.getElementById('contact-ward');
    const addressDetailInput = document.getElementById('contact-address-detail');
    const phoneInput = document.getElementById('contact-phone');
    const emailInput = document.getElementById('contact-email');
    const facebookInput = document.getElementById('contact-facebook');
    const twitterInput = document.getElementById('contact-twitter');
    const instagramInput = document.getElementById('contact-instagram');
    const youtubeInput = document.getElementById('contact-youtube');

    const setSelectState = (select, placeholder, disabled) => {
        if (!select) return;
        select.innerHTML = `<option value="">${placeholder}</option>`;
        select.disabled = !!disabled;
    };

    const loadWards = async (districtCode, applyInitial) => {
        if (!wardSelect) return;
        if (!districtCode) {
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        const initialWardName = wardSelect.dataset.initialName || '';
        setSelectState(wardSelect, 'Đang tải phường/xã...', true);
        try {
            if (!contactWardsByDistrict[districtCode]) {
                const data = await contactFetchJson(`${CONTACT_PROVINCES_API_BASE}/d/${districtCode}?depth=2`);
                contactWardsByDistrict[districtCode] = data.wards || [];
            }
            const wards = contactWardsByDistrict[districtCode];
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
                if (opt) wardSelect.value = opt.value;
            }
        } catch (err) {
            setSelectState(wardSelect, 'Không tải được phường/xã', true);
            showNotification('Không tải được danh sách phường/xã. Vui lòng thử lại.', 'error');
        }
    };

    const loadDistricts = async (provinceCode, applyInitial) => {
        if (!districtSelect || !wardSelect) return;
        if (!provinceCode) {
            setSelectState(districtSelect, 'Chọn quận/huyện', true);
            setSelectState(wardSelect, 'Chọn phường/xã', true);
            return;
        }
        const initialDistrictName = districtSelect.dataset.initialName || '';
        setSelectState(districtSelect, 'Đang tải quận/huyện...', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!contactDistrictsByProvince[provinceCode]) {
                const data = await contactFetchJson(`${CONTACT_PROVINCES_API_BASE}/p/${provinceCode}?depth=2`);
                contactDistrictsByProvince[provinceCode] = data.districts || [];
            }
            const districts = contactDistrictsByProvince[provinceCode];
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
    };

    const loadProvinces = async () => {
        if (!citySelect || !districtSelect || !wardSelect) return;
        const initialCityName = citySelect.dataset.initialName || '';
        setSelectState(citySelect, 'Đang tải tỉnh/thành...', true);
        setSelectState(districtSelect, 'Chọn quận/huyện', true);
        setSelectState(wardSelect, 'Chọn phường/xã', true);
        try {
            if (!contactProvinces) {
                contactProvinces = await contactFetchJson(`${CONTACT_PROVINCES_API_BASE}/p/`);
            }
            citySelect.innerHTML = '<option value="">Chọn tỉnh/thành phố</option>';
            contactProvinces
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
                .forEach(p => {
                    const opt = document.createElement('option');
                    opt.value = String(p.code);
                    opt.textContent = p.name;
                    citySelect.appendChild(opt);
                });
            citySelect.disabled = false;
            if (initialCityName) {
                const opt = Array.from(citySelect.options).find(o => o.textContent === initialCityName);
                if (opt) {
                    citySelect.value = opt.value;
                    await loadDistricts(opt.value, true);
                }
            }
        } catch (err) {
            setSelectState(citySelect, 'Không tải được tỉnh/thành', true);
            showNotification('Không tải được danh sách tỉnh/thành. Vui lòng thử lại.', 'error');
        }
    };

    const fillForm = () => {
        const data = getContactInfo();
        if (citySelect) citySelect.dataset.initialName = data.store_city || '';
        if (districtSelect) districtSelect.dataset.initialName = data.store_district || '';
        if (wardSelect) wardSelect.dataset.initialName = data.store_ward || '';
        if (addressDetailInput) addressDetailInput.value = data.store_address_detail || '';
        if (phoneInput) phoneInput.value = data.phone || '';
        if (emailInput) emailInput.value = data.email || '';
        if (facebookInput) facebookInput.value = data.facebook || '';
        if (twitterInput) twitterInput.value = data.twitter || '';
        if (instagramInput) instagramInput.value = data.instagram || '';
        if (youtubeInput) youtubeInput.value = data.youtube || '';
    };

    fillForm();
    loadProvinces();

    if (citySelect && districtSelect && wardSelect) {
        citySelect.addEventListener('change', function() {
            districtSelect.dataset.initialName = '';
            wardSelect.dataset.initialName = '';
            loadDistricts(this.value, false);
        });
        districtSelect.addEventListener('change', function() {
            wardSelect.dataset.initialName = '';
            loadWards(this.value, false);
        });
    }

    if (resetBtn) {
        resetBtn.onclick = e => {
            e.preventDefault();
            fillForm();
            loadProvinces();
            showNotification('Đã làm mới dữ liệu liên hệ', 'success');
        };
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!hasPermission('contact', 'manage') && !canAccessSection('contact-management')) {
            showNotification('Bạn không có quyền quản lý liên hệ', 'error');
            return;
        }

        const city = citySelect && citySelect.selectedIndex > 0 ? citySelect.options[citySelect.selectedIndex].textContent : '';
        const district = districtSelect && districtSelect.selectedIndex > 0 ? districtSelect.options[districtSelect.selectedIndex].textContent : '';
        const ward = wardSelect && wardSelect.selectedIndex > 0 ? wardSelect.options[wardSelect.selectedIndex].textContent : '';
        const addressDetail = (addressDetailInput ? addressDetailInput.value : '').trim();
        const address = formatAddressParts(addressDetail, ward, district, city);

        const next = {
            store_city: city.trim(),
            store_district: district.trim(),
            store_ward: ward.trim(),
            store_address_detail: addressDetail,
            address,
            phone: (phoneInput ? phoneInput.value : '').trim(),
            email: (emailInput ? emailInput.value : '').trim(),
            facebook: (facebookInput ? facebookInput.value : '').trim(),
            twitter: (twitterInput ? twitterInput.value : '').trim(),
            instagram: (instagramInput ? instagramInput.value : '').trim(),
            youtube: (youtubeInput ? youtubeInput.value : '').trim()
        };

        if (!next.store_city || !next.store_district || !next.store_ward || !next.store_address_detail) {
            showNotification('Vui lòng nhập đầy đủ địa chỉ cửa hàng', 'error');
            return;
        }
        if (!next.phone) {
            showNotification('Số điện thoại không được trống', 'error');
            return;
        }
        if (!next.email) {
            showNotification('Email không được trống', 'error');
            return;
        }

        saveContactInfo(next);
        showNotification('Lưu thay đổi liên hệ thành công!', 'success');
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
    
    const canDeleteOrders = hasPermission('orders', 'delete');

    orders.forEach(order => {
        const row = document.createElement('tr');
        
        // Format tổng tiền
        const formattedTotal = order.total.toLocaleString('vi-VN') + ' VNĐ';
        
        // Format ngày
        const orderDate = new Date(order.createdAt);
        const formattedDate = orderDate.toLocaleDateString('vi-VN');
        
        // Lấy tên người nhận từ deliveryInfo hoặc customerName (để tương thích cũ)
        const customerName = order.deliveryInfo?.fullname || order.customerName || 'N/A';
        
        const deleteButtonHtml = canDeleteOrders ? `
                    <button class="btn-delete-order" data-order-id="${order.id}" title="Xóa đơn hàng">
                        <i class="fas fa-trash"></i>
                    </button>
        ` : '';

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
                    ${deleteButtonHtml}
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
        'packing': 'Đang đóng gói',
        'shipping': 'Đang vận chuyển',
        'delivered': 'Đã giao hàng',
        'cancelled': 'Đã hủy'
    };
    
    return statusMap[status] || status;
}

// Tải người dùng
function loadUsers() {
    if (!hasPermission('users', 'manage')) return;
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
            email: 'products@customstore.com',
            role: 'staff_products',
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString()
        },
        {
            id: 6,
            fullName: 'Nhân viên Đơn hàng',
            email: 'orders@customstore.com',
            role: 'staff_orders',
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString()
        },
        {
            id: 7,
            fullName: 'Thu ngân',
            email: 'cashier@customstore.com',
            role: 'cashier',
            status: 'active',
            createdAt: new Date('2024-02-01').toISOString()
        },
        {
            id: 8,
            fullName: 'Nhân viên Marketing',
            email: 'marketing@customstore.com',
            role: 'staff_marketing',
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
    
    const canManageUsers = hasPermission('users', 'manage');

    users.forEach(user => {
        const row = document.createElement('tr');
        
        // Format ngày
        const userDate = new Date(user.createdAt);
        const formattedDate = userDate.toLocaleDateString('vi-VN');
        
        const actionButtonsHtml = canManageUsers ? `
                <div class="action-buttons">
                    <button class="btn-edit" data-user-id="${user.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" data-user-id="${user.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
        ` : '';

        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.fullName}</td>
            <td>${user.email}</td>
            <td>${getRoleLabel(user.role)}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge status-${user.status}-user">
                    ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </span>
            </td>
            <td>
                ${actionButtonsHtml}
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    initUserTableEvents();
}

function handleUserEdit() {
    if (!hasPermission('users', 'manage')) {
        showNotification('Bạn không có quyền quản lý người dùng', 'error');
        return;
    }
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
    if (!hasPermission('users', 'manage')) {
        showNotification('Bạn không có quyền quản lý người dùng', 'error');
        return;
    }
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
    if (!hasPermission('users', 'manage')) return;
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
        if (!hasPermission('users', 'manage')) {
            showNotification('Bạn không có quyền quản lý người dùng', 'error');
            return;
        }
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
                
                const actionButtonsHtml = `
                        <div class="action-buttons">
                            <button class="btn-edit" data-user-id="${user.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete" data-user-id="${user.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                `;

                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.fullName}</td>
                    <td>${user.email}</td>
                    <td>${getRoleLabel(user.role)}</td>
                    <td>${formattedDate}</td>
                    <td>
                        <span class="status-badge status-${user.status}-user">
                            ${user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                    </td>
                    <td>
                        ${actionButtonsHtml}
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
            if (!hasPermission('orders', 'delete')) return;
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
    if (!hasPermission('orders', 'updateStatus')) {
        statusSelect.setAttribute('disabled', 'true');
    } else {
        statusSelect.removeAttribute('disabled');
    }
    
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
        if (!hasPermission('orders', 'delete')) {
            deleteBtn.setAttribute('disabled', 'true');
            deleteBtn.style.pointerEvents = 'none';
            deleteBtn.style.opacity = '0.5';
            deleteBtn.style.cursor = 'not-allowed';
            deleteBtn.onclick = null;
        } else {
            deleteBtn.removeAttribute('disabled');
            deleteBtn.style.pointerEvents = '';
            deleteBtn.style.opacity = '';
            deleteBtn.style.cursor = '';
            deleteBtn.onclick = function() {
                deleteOrder(orderId);
            };
        }
    }
    
    // Thêm event listener cho nút lưu trạng thái đơn hàng
    const saveStatusBtn = document.getElementById('save-order-status-btn');
    if (saveStatusBtn) {
        if (!hasPermission('orders', 'updateStatus')) {
            saveStatusBtn.setAttribute('disabled', 'true');
            saveStatusBtn.style.pointerEvents = 'none';
            saveStatusBtn.style.opacity = '0.5';
            saveStatusBtn.style.cursor = 'not-allowed';
            saveStatusBtn.onclick = null;
        } else {
            saveStatusBtn.removeAttribute('disabled');
            saveStatusBtn.style.pointerEvents = '';
            saveStatusBtn.style.opacity = '';
            saveStatusBtn.style.cursor = '';
            saveStatusBtn.onclick = function() {
                const newStatus = document.getElementById('modal-order-status-select').value;
                saveOrderStatus(orderId, newStatus);
            };
        }
    }
    
    // Hiển thị modal
    modal.style.display = 'flex';
}

// Lưu trạng thái đơn hàng
function saveOrderStatus(orderId, newStatus) {
    if (!hasPermission('orders', 'updateStatus')) {
        showNotification('Bạn không có quyền cập nhật trạng thái đơn hàng', 'error');
        return;
    }
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
    window.dispatchEvent(new Event('ordersUpdated'));
    
    // Cập nhật bảng đơn hàng
    loadOrders();
    
    // Cập nhật dashboard
    loadDashboardData();

    if (document.getElementById('analytics-orders-source-chart')) {
        renderAnalytics();
    }
    
    // Hiển thị thông báo
    showNotification('Cập nhật trạng thái đơn hàng thành công!', 'success');
}

// Xóa đơn hàng
function deleteOrder(orderId) {
    if (!hasPermission('orders', 'delete')) {
        showNotification('Bạn không có quyền xóa đơn hàng', 'error');
        return;
    }
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
    window.dispatchEvent(new Event('ordersUpdated'));
    
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
    if (document.getElementById('analytics-orders-source-chart')) {
        renderAnalytics();
    }
}

// Bài viết
function getPosts() {
    return JSON.parse(localStorage.getItem('posts')) || [];
}
function savePosts(posts) {
    localStorage.setItem('posts', JSON.stringify(posts));
}
function loadPosts() {
    if (!hasPermission('posts', 'manage')) return;
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
    const canManagePosts = hasPermission('posts', 'manage');

    posts.slice().reverse().forEach(post => {
        const date = new Date(post.createdAt);
        const formattedDate = date.toLocaleDateString('vi-VN');
        const row = document.createElement('tr');

        const actionButtonsHtml = canManagePosts ? `
                <div class="action-buttons">
                    <button class="btn-edit" data-post-id="${post.id}" title="Sửa"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-post-id="${post.id}" title="Xóa"><i class="fas fa-trash"></i></button>
                    <button class="btn-secondary btn-toggle" data-post-id="${post.id}" title="Ẩn/Hiện">
                        <i class="fas fa-eye${post.status === 'hidden' ? '-slash' : ''}"></i>
                    </button>
                </div>
        ` : '';

        row.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.author}</td>
            <td>${formattedDate}</td>
            <td>
                <span class="status-badge ${post.status === 'visible' ? 'status-in-stock' : 'status-out-of-stock'}">
                    ${post.status === 'visible' ? 'Công khai' : 'Nháp'}
                </span>
            </td>
            <td>
                ${actionButtonsHtml}
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
    if (!hasPermission('posts', 'manage')) return;
    const editor = document.getElementById('post-content');
    const fontfamilySelect = document.getElementById('editor-fontfamily');
    const fontSizeInput = modal.querySelector('.editor-fontsize-input');
    const fontSizeButtons = modal.querySelectorAll('.editor-fontsize-btn[data-action]');
    const imageInput = document.getElementById('editor-image');
    const imageDropzone = document.getElementById('post-image-dropzone');
    const imageGrid = document.getElementById('post-image-preview-grid');
    const insertImageBtn = document.getElementById('post-insert-image-btn');

    let savedRange = null;
    const uploadedImages = new Map();

    const saveSelection = () => {
        if (!editor) return;
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const r = sel.getRangeAt(0);
        if (!editor.contains(r.commonAncestorContainer)) return;
        savedRange = r.cloneRange();
    };

    if (editor) {
        editor.onmouseup = saveSelection;
        editor.onkeyup = saveSelection;
        editor.ontouchend = saveSelection;
        const onSelectionChange = () => saveSelection();
        document.addEventListener('selectionchange', onSelectionChange);
    }

    const ensureSelection = () => {
        if (!editor) return;
        editor.focus();
        const sel = window.getSelection();
        if (!sel) return;
        if (savedRange) {
            sel.removeAllRanges();
            sel.addRange(savedRange);
            return;
        }
        const range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
        savedRange = range.cloneRange();
    };

    const stripStyleProp = (root, prop) => {
        if (!root) return;
        root.querySelectorAll('[style]').forEach(el => {
            if (!el.style) return;
            if (prop === 'font-size' && el.style.fontSize) {
                el.style.fontSize = '';
                if (!el.getAttribute('style')) el.removeAttribute('style');
            }
            if (prop === 'font-family' && el.style.fontFamily) {
                el.style.fontFamily = '';
                if (!el.getAttribute('style')) el.removeAttribute('style');
            }
        });
        root.querySelectorAll('font[face]').forEach(node => {
            const span = document.createElement('span');
            span.style.fontFamily = node.getAttribute('face') || '';
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
        root.querySelectorAll('font[size]').forEach(node => {
            const span = document.createElement('span');
            span.innerHTML = node.innerHTML;
            node.replaceWith(span);
        });
    };

    const applyInlineStyle = styleString => {
        if (!editor) return;
        ensureSelection();
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const range = sel.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) return;

        if (range.collapsed) {
            const span = document.createElement('span');
            span.setAttribute('style', styleString);
            const text = document.createTextNode('\u200B');
            span.appendChild(text);
            range.insertNode(span);
            const nextRange = document.createRange();
            nextRange.setStart(text, 1);
            nextRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(nextRange);
            savedRange = nextRange.cloneRange();
            return;
        }

        const extracted = range.extractContents();
        const wrapper = document.createElement('span');
        wrapper.setAttribute('style', styleString);
        wrapper.appendChild(extracted);
        stripStyleProp(wrapper, styleString.startsWith('font-size') ? 'font-size' : 'font-family');
        range.insertNode(wrapper);
        const newRange = document.createRange();
        newRange.selectNodeContents(wrapper);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        savedRange = newRange.cloneRange();
    };

    const applyFontFamily = font => {
        if (!font) return;
        const sel = window.getSelection();
        const hasSel = sel && sel.rangeCount && !sel.getRangeAt(0).collapsed;
        if (hasSel) {
            ensureSelection();
            document.execCommand('fontName', false, font);
            saveSelection();
            return;
        }
        applyInlineStyle(`font-family:${font};`);
    };

    const applyFontSize = px => {
        if (!px) return;
        applyInlineStyle(`font-size:${px}px;`);
    };

    modal.querySelectorAll('.editor-toolbar button[data-cmd]').forEach(btn => {
        btn.onclick = function(e) {
            e.preventDefault();
            ensureSelection();
            const cmd = this.getAttribute('data-cmd');
            if (!cmd) return;
            document.execCommand(cmd, false, null);
            saveSelection();
        };
    });
    if (fontfamilySelect) {
        fontfamilySelect.onchange = function() {
            applyFontFamily(this.value);
        };
    }

    const applyFontSizeFromControl = nextValue => {
        const n = parseInt(nextValue, 10);
        if (Number.isNaN(n)) return;
        const clamped = Math.max(1, Math.min(72, n));
        if (fontSizeInput) fontSizeInput.value = String(clamped);
        applyFontSize(clamped);
    };

    const bumpFontSize = delta => {
        const current = fontSizeInput ? parseInt(fontSizeInput.value, 10) : 14;
        const base = Number.isNaN(current) ? 14 : current;
        applyFontSizeFromControl(base + delta);
    };

    fontSizeButtons.forEach(btn => {
        btn.onmousedown = e => e.preventDefault();
        btn.onclick = e => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            if (action === 'inc') bumpFontSize(1);
            if (action === 'dec') bumpFontSize(-1);
        };
    });

    if (fontSizeInput) {
        fontSizeInput.onmousedown = e => e.stopPropagation();
        fontSizeInput.onkeydown = e => {
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                bumpFontSize(1);
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                bumpFontSize(-1);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                applyFontSizeFromControl(fontSizeInput.value);
            }
        };
        fontSizeInput.onchange = () => applyFontSizeFromControl(fontSizeInput.value);
        fontSizeInput.onblur = () => applyFontSizeFromControl(fontSizeInput.value);
    }
    const renderUploadedPreviews = () => {
        if (!imageDropzone || !imageGrid) return;
        const placeholder = imageDropzone.querySelector('.dropzone-placeholder');
        imageGrid.innerHTML = '';
        const entries = Array.from(uploadedImages.entries());
        if (placeholder) placeholder.style.display = entries.length ? 'none' : '';
        entries.forEach(([id, data]) => {
            const wrap = document.createElement('div');
            wrap.className = 'preview-item';
            const img = document.createElement('img');
            img.src = data.dataUrl;
            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'preview-delete-btn';
            del.innerHTML = '&times;';
            del.onclick = e => {
                e.preventDefault();
                e.stopPropagation();
                uploadedImages.delete(id);
                if (editor) {
                    const node = editor.querySelector(`img[data-upload-id="${id}"]`);
                    if (node) node.remove();
                }
                renderUploadedPreviews();
            };
            wrap.appendChild(img);
            wrap.appendChild(del);
            imageGrid.appendChild(wrap);
        });
    };

    const insertImageAtCaret = (dataUrl, uploadId) => {
        if (!editor) return;
        ensureSelection();
        const imgHtml = `<img src="${dataUrl}" data-upload-id="${uploadId}" style="max-width:100%;border-radius:12px;display:block;margin:10px 0;" />`;
        document.execCommand('insertHTML', false, imgHtml);
        saveSelection();
    };

    const addImageFiles = files => {
        const list = Array.isArray(files) ? files : [];
        list.forEach(file => {
            if (!file || !file.type || !file.type.startsWith('image/')) return;
            const reader = new FileReader();
            const id = 'up_' + Date.now() + '_' + Math.random().toString(16).slice(2);
            reader.onload = e => {
                const dataUrl = e.target.result;
                uploadedImages.set(id, { dataUrl });
                insertImageAtCaret(dataUrl, id);
                renderUploadedPreviews();
            };
            reader.readAsDataURL(file);
        });
    };

    const openFilePicker = () => {
        if (imageInput) imageInput.click();
    };

    if (insertImageBtn) {
        insertImageBtn.onclick = e => {
            e.preventDefault();
            openFilePicker();
        };
    }

    if (imageInput) {
        imageInput.onchange = function() {
            const files = this.files ? Array.from(this.files) : [];
            if (!files.length) return;
            addImageFiles(files);
            this.value = '';
        };
    }

    if (imageDropzone) {
        imageDropzone.onclick = e => {
            if (e.target.closest('.preview-delete-btn')) return;
            openFilePicker();
        };
        imageDropzone.ondragover = e => {
            e.preventDefault();
            imageDropzone.classList.add('dragover');
        };
        imageDropzone.ondragleave = e => {
            e.preventDefault();
            imageDropzone.classList.remove('dragover');
        };
        imageDropzone.ondrop = e => {
            e.preventDefault();
            imageDropzone.classList.remove('dragover');
            const files = e.dataTransfer && e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
            if (!files.length) return;
            addImageFiles(files);
        };
        imageDropzone.onkeydown = e => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openFilePicker();
            }
        };
    }
    addBtn.addEventListener('click', function() {
        document.getElementById('post-editor-title').textContent = 'Thêm bài viết';
        document.getElementById('post-id').value = '';
        document.getElementById('post-title').value = '';
        document.getElementById('post-author').value = '';
        document.getElementById('post-status').value = 'visible';
        document.getElementById('post-content').innerHTML = '';
        if (fontSizeInput) fontSizeInput.value = '14';
        uploadedImages.clear();
        renderUploadedPreviews();
        modal.style.display = 'flex';
    });
    closeBtns.forEach(btn => btn.addEventListener('click', function() {
        modal.style.display = 'none';
        uploadedImages.clear();
        renderUploadedPreviews();
    }));
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            uploadedImages.clear();
            renderUploadedPreviews();
        }
    });
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (!hasPermission('posts', 'manage')) {
            showNotification('Bạn không có quyền quản lý bài viết', 'error');
            return;
        }
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
            if (!hasPermission('posts', 'manage')) {
                showNotification('Bạn không có quyền quản lý bài viết', 'error');
                return;
            }
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
            if (fontSizeInput) fontSizeInput.value = '14';
            uploadedImages.clear();
            renderUploadedPreviews();
            modal.style.display = 'flex';
        }
        if (deleteBtn) {
            if (!hasPermission('posts', 'manage')) {
                showNotification('Bạn không có quyền quản lý bài viết', 'error');
                return;
            }
            const postId = deleteBtn.getAttribute('data-post-id');
            if (!confirm('Bạn có chắc chắn muốn xóa bài viết này?')) return;
            let posts = getPosts();
            posts = posts.filter(p => String(p.id) !== String(postId));
            savePosts(posts);
            displayPostsTable(posts);
            showNotification('Đã xóa bài viết', 'success');
        }
        if (toggleBtn) {
            if (!hasPermission('posts', 'manage')) {
                showNotification('Bạn không có quyền quản lý bài viết', 'error');
                return;
            }
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
