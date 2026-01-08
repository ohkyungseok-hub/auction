/**
 * API 클라이언트 모듈
 * 데이터베이스 API 서버와 통신하는 함수들
 */

const API_BASE_URL = 'http://localhost:5000/api';

// API 호출 헬퍼 함수
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        if (data) {
            options.body = JSON.stringify(data);
        }
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API 호출 실패:', error);
        // 폴백: LocalStorage 사용
        console.log('LocalStorage로 폴백합니다.');
        return null;
    }
}

// ==================== 상품 관리 ====================
async function getProducts() {
    const result = await apiCall('/products');
    if (result) {
        return result;
    }
    // 폴백: LocalStorage
    return JSON.parse(localStorage.getItem('products') || '[]');
}

async function addProduct(product) {
    const result = await apiCall('/products', 'POST', {
        name: product.name,
        description: product.description,
        quantity: product.quantity,
        unit: product.unit || '개',
        minPrice: product.minPrice,
        supplierName: product.supplierName,
        supplierEmail: product.supplierEmail || '',
        expiryDate: product.expiryDate,
        auctionStartDate: product.auctionStartDate || new Date().toISOString(),
        auctionEndDate: product.auctionEndDate
    });
    
    if (result) {
        return result.id;
    }
    // 폴백: LocalStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    product.id = Date.now().toString();
    product.createdAt = new Date().toISOString();
    product.bids = [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
    return product.id;
}

async function getProductById(productId) {
    const result = await apiCall(`/products/${productId}`);
    if (result) {
        return result;
    }
    // 폴백: LocalStorage
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    return products.find(p => p.id === productId) || null;
}

async function deleteProduct(productId) {
    const result = await apiCall(`/products/${productId}`, 'DELETE');
    if (result) {
        return true;
    }
    // 폴백: LocalStorage
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    products = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(products));
    return true;
}

// ==================== 입찰 관리 ====================
async function addBid(productId, bid) {
    const result = await apiCall('/bids', 'POST', {
        productId: productId,
        bidderName: bid.bidderName,
        bidderEmail: bid.bidderEmail || '',
        amount: bid.amount
    });
    
    if (result) {
        // 상품 정보 업데이트를 위해 다시 가져오기
        return await getProductById(productId);
    }
    // 폴백: LocalStorage
    let products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    if (product) {
        if (!product.bids) product.bids = [];
        bid.id = Date.now().toString();
        bid.timestamp = new Date().toISOString();
        product.bids.push(bid);
        localStorage.setItem('products', JSON.stringify(products));
        return product;
    }
    return null;
}

async function getProductBids(productId) {
    const result = await apiCall(`/products/${productId}/bids`);
    if (result) {
        return result;
    }
    // 폴백: LocalStorage
    const product = await getProductById(productId);
    return product ? (product.bids || []) : [];
}

// ==================== 회원 관리 ====================
async function getMembers() {
    const result = await apiCall('/members');
    if (result) {
        return result;
    }
    // 폴백: LocalStorage
    return JSON.parse(localStorage.getItem('members') || '[]');
}

async function addMember(member) {
    const result = await apiCall('/members', 'POST', {
        name: member.name,
        email: member.email,
        password: member.password || '',
        company: member.company || '',
        phone: member.phone || '',
        type: member.type || 'buyer'
    });
    
    if (result) {
        return result.id;
    }
    // 폴백: LocalStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    member.id = Date.now().toString();
    member.createdAt = new Date().toISOString();
    members.push(member);
    localStorage.setItem('members', JSON.stringify(members));
    return member.id;
}

async function getMemberByEmail(email) {
    const result = await apiCall(`/members/${email}`);
    if (result && !result.error) {
        return result;
    }
    // 폴백: LocalStorage
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    return members.find(m => m.email === email) || null;
}

// ==================== 배너 관리 ====================
async function getBanners() {
    const result = await apiCall('/banners');
    if (result) {
        return result;
    }
    // 폴백: LocalStorage
    return JSON.parse(localStorage.getItem('banners') || '[]');
}

async function addBanner(banner) {
    const result = await apiCall('/banners', 'POST', {
        title: banner.title,
        description: banner.description || '',
        imageUrl: banner.imageUrl || '',
        link: banner.link || '',
        order: banner.order || 0,
        active: banner.active !== false
    });
    
    if (result) {
        return result.id;
    }
    // 폴백: LocalStorage
    const banners = JSON.parse(localStorage.getItem('banners') || '[]');
    banner.id = Date.now().toString();
    banner.createdAt = new Date().toISOString();
    banners.push(banner);
    localStorage.setItem('banners', JSON.stringify(banners));
    return banner.id;
}

// ==================== 관리자 인증 ====================
async function adminLogin(adminId, password) {
    const result = await apiCall('/admin/login', 'POST', {
        id: adminId,
        password: password
    });
    
    if (result && !result.error) {
        return result;
    }
    // 폴백: LocalStorage
    const admins = JSON.parse(localStorage.getItem('adminAccounts') || '[]');
    return admins.find(a => a.id === adminId && a.password === password) || null;
}
