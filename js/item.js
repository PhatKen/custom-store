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
        gender: 'unisex',
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
        gender: 'male',
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
        gender: 'unisex',
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
        gender: 'unisex',
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
        gender: 'male',
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
        gender: 'unisex',
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
        gender: 'female',
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
        gender: 'female',
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
        gender: 'female',
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
        gender: 'male',
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
        gender: 'female',
        createdAt: new Date().toISOString()
    },
    {
        id: 12,
        name: 'NikeCourt Slam',
        category: 'ao',
        price: 1100000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao5.png',
        quantity: 28,
        sold: 73,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    // Danh mục áo
    {
        id: 13,
        name: 'Áo thun đen',
        category: 'ao',
        price: 1250000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao6.png',
        quantity: 71,
        sold: 45,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 14,
        name: 'Áo thun đen tay dài',
        category: 'ao',
        price: 1050000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao7.png',
        quantity: 47,
        sold: 77,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 15,
        name: 'Nike-life',
        category: 'ao',
        price: 2300000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao8.png',
        quantity: 19,
        sold: 34,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 16,
        name: 'Nike sportswear',
        category: 'ao',
        price: 1500000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao9.png',
        quantity: 28,
        sold: 73,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 17,
        name: 'Nikecourt heritage',
        category: 'ao',
        price: 1360000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao10.png',
        quantity: 56,
        sold: 34,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 18,
        name: 'Nike air',
        category: 'ao',
        price: 1100000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao11.png',
        quantity: 36,
        sold: 67,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 19,
        name: 'Jordan Flight',
        category: 'ao',
        price: 1100000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao12.png',
        quantity: 42,
        sold: 17,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 20,
        name: 'Áo Thun Training',
        category: 'ao',
        price: 1710000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao13.png',
        quantity: 68,
        sold: 20,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 21,
        name: 'Áo thun workout',
        category: 'ao',
        price: 1400000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao14.png',
        quantity: 79,
        sold: 34,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 22,
        name: 'Áo Polo ngắn tay',
        category: 'ao',
        price: 2200000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao15.png',
        quantity: 22,
        sold: 16,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 23,
        name: 'Nike Sportswear Tech',
        category: 'ao',
        price: 1670000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao16.png',
        quantity: 68,
        sold: 20,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 24,
        name: 'Áo Singlet All Time',
        category: 'ao',
        price: 1120000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao17.png',
        quantity: 84,
        sold: 43,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 24,
        name: 'Áo thun chest Stripes Engineered Collar',
        category: 'ao',
        price: 1550000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao18.png',
        quantity: 46,
        sold: 43,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 25,
        name: 'Áo dài tay adi365',
        category: 'ao',
        price: 2130000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao19.png',
        quantity: 41,
        sold: 55,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 26,
        name: 'Áo Thun Terrex Multi Meadow Pack',
        category: 'ao',
        price: 2050000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao20.png',
        quantity: 51,
        sold: 11,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 27,
        name: 'Áo Polo dài tay',
        category: 'ao',
        price: 1120000,
        description: 'Áo thể thao, rộng rãi, thoáng mát.',
        image: 'image/ao21.png',
        quantity: 124,
        sold: 43,
        gender: 'male',
        createdAt: new Date().toISOString()
    },
    {
        id: 28,
        name: 'Quần jeans slimfit',
        category: 'quan',
        price: 1030000,
        description: 'Quần thể thao, rộng rãi, thoáng mát',
        image: 'image/quan/quan1.png',
        quantity: 43,
        sold: 68,
        gender: 'male',
        createdAt: new Date().toISOString()
    }
];

function getDefaultProducts() {
    return DEFAULT_PRODUCTS.map(p => ({ ...p }));
}

// Sync data cho phép chỉnh thủ công trực tiếp trong item.js
// (Khi muốn sửa product chỉ cần edit DEFAULT_PRODUCTS, không cần vào admin)
const DEFAULT_PRODUCTS_VERSION = 1;
const CURRENT_PRODUCTS_VERSION = parseInt(localStorage.getItem('itemProductsVersion') || '0', 10);
if (CURRENT_PRODUCTS_VERSION !== DEFAULT_PRODUCTS_VERSION) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem('itemProductsVersion', String(DEFAULT_PRODUCTS_VERSION));
}

