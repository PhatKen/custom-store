const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: 'Áo thun basic nam nữ',
        category: 'ao',
        price: 199000,
        description: 'Áo thun basic chất liệu cotton thoáng mát, dễ phối đồ',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        quantity: 50,
        sold: 152,
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
        sold: 98,
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
        sold: 45,
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
        sold: 189,
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
        sold: 67,
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
        sold: 134,
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
        sold: 76,
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
        sold: 53,
        createdAt: new Date().toISOString()
    },
    {
        id: 9,
        name: 'Áo khoác nữ oversize',
        category: 'ao',
        price: 250000,
        description: 'Áo hoodie màu kem form rộng, có khóa kéo phía trước và dây rút ở mũ, tạo phong cách trẻ trung và thoải mái.',
        image: 'image/ao3.png',
        quantity: 34,
        sold: 41,
        createdAt: new Date().toISOString()
    },
    {
        id: 10,
        name: 'Áo khoác nam xành điệu',
        category: 'ao',
        price: 310000,
        description: 'Áo khoác jean màu đen được treo trên móc, bên trong phối với áo thun trắng tạo phong cách đơn giản và hiện đại. Bên dưới có vài bộ quần áo được gấp gọn cùng một chậu cây trang trí, tạo cảm giác trưng bày như trong cửa hàng thời trang.',
        image: 'image/ao2.png',
        quantity: 62,
        sold: 73,
        createdAt: new Date().toISOString()
    },
    {
        id: 11,
        name: 'Túi xách nữ thời trang',
        category: 'tuixach',
        price: 580000,
        description: 'Túi xách nữ da PU, form chữ nhật, quai xách và dây đeo chéo tiện lợi.',
        image: 'https://images.unsplash.com/photo-1520975897352-ef4446ca173a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
        quantity: 33,
        sold: 12,
        createdAt: new Date().toISOString()
    }
];

function getDefaultProducts() {
    return DEFAULT_PRODUCTS.map(p => ({ ...p }));
}

