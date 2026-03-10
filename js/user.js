const DEFAULT_USERS = [
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

function getDefaultUsers() {
    return DEFAULT_USERS.map(user => ({ ...user }));
}
