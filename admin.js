// ==================== 데이터 관리 ====================
// api_client.js가 로드되어 있어야 합니다
// 모든 함수는 비동기로 변경되었습니다

// ==================== 유틸리티 함수 ====================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function isAuctionEnded(auctionEndDate) {
    return new Date(auctionEndDate) < new Date();
}

function isAuctionStarted(auctionStartDate) {
    return new Date(auctionStartDate) <= new Date();
}

function isExpired(expiryDate) {
    return new Date(expiryDate) < new Date();
}

function getAuctionStatus(product) {
    const now = new Date();
    const startDate = new Date(product.auction_start_date || product.auctionStartDate || product.created_at || product.createdAt);
    const endDate = new Date(product.auction_end_date || product.auctionEndDate);
    const expiryDate = product.expiry_date || product.expiryDate;
    const expired = isExpired(expiryDate);
    
    if (expired) {
        return { text: '유통기한 만료', class: 'status-expired' };
    } else if (endDate < now) {
        return { text: '종료됨', class: 'status-ended' };
    } else if (startDate > now) {
        return { text: '예정', class: 'status-scheduled' };
    } else {
        return { text: '진행중', class: 'status-active' };
    }
}

function getHighestBid(product) {
    if (!product.bids || product.bids.length === 0) {
        return '-';
    }
    const highest = Math.max(...product.bids.map(b => b.amount));
    return `${highest.toLocaleString()}원`;
}

// ==================== 통계 업데이트 ====================
async function updateStats() {
    const products = await getProducts();
    const members = await getMembers();
    const now = new Date();
    
    const totalAuctions = products.length;
    const activeAuctions = products.filter(p => {
        const startDate = new Date(p.auction_start_date || p.auctionStartDate || p.created_at || p.createdAt);
        const endDate = new Date(p.auction_end_date || p.auctionEndDate);
        const expiryDate = p.expiry_date || p.expiryDate;
        return startDate <= now && endDate >= now && !isExpired(expiryDate);
    }).length;
    const endedAuctions = products.filter(p => {
        const endDate = p.auction_end_date || p.auctionEndDate;
        const expiryDate = p.expiry_date || p.expiryDate;
        return isAuctionEnded(endDate) || isExpired(expiryDate);
    }).length;
    const scheduledAuctions = products.filter(p => {
        const startDate = new Date(p.auction_start_date || p.auctionStartDate || p.created_at || p.createdAt);
        return startDate > now;
    }).length;
    
    // 각 상품의 입찰 수 가져오기
    let totalBids = 0;
    for (const product of products) {
        const bids = await getProductBids(product.id);
        totalBids += bids.length;
    }
    
    const totalMembers = members.length;
    
    document.getElementById('total-auctions').textContent = totalAuctions;
    document.getElementById('active-auctions').textContent = activeAuctions;
    document.getElementById('ended-auctions').textContent = endedAuctions;
    document.getElementById('scheduled-auctions').textContent = scheduledAuctions;
    document.getElementById('total-members').textContent = totalMembers;
    document.getElementById('total-bids').textContent = totalBids;
}

// ==================== 메인 탭 전환 ====================
let currentMainTab = 'auctions';

async function showMainTab(tab) {
    currentMainTab = tab;
    
    // 모든 메인 탭 콘텐츠 숨기기
    document.querySelectorAll('.main-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 모든 메인 탭 버튼 비활성화
    document.querySelectorAll('.main-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택한 탭 활성화
    document.getElementById(`tab-${tab}`).classList.add('active');
    event.target.classList.add('active');
    
    // 각 탭별 렌더링
    if (tab === 'auctions') {
        await renderAuctions();
    } else if (tab === 'members') {
        await renderMembers();
    } else if (tab === 'products') {
        await renderProducts();
    } else if (tab === 'banners') {
        await renderBanners();
    }
}

// ==================== 경매목록 탭 ====================
let currentAuctionTab = 'all';

async function showAuctionTab(tab) {
    currentAuctionTab = tab;
    
    document.querySelectorAll('.sub-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    await renderAuctions();
}

async function renderAuctions() {
    const tbody = document.getElementById('admin-auctions-tbody');
    const noAuctions = document.getElementById('no-auctions');
    
    if (!tbody) return;
    
    let products = await getProducts();
    const now = new Date();
    
    // 탭에 따라 필터링
    if (currentAuctionTab === 'active') {
        products = products.filter(p => {
            const startDate = new Date(p.auction_start_date || p.auctionStartDate || p.created_at || p.createdAt);
            const endDate = new Date(p.auction_end_date || p.auctionEndDate);
            const expiryDate = p.expiry_date || p.expiryDate;
            return startDate <= now && endDate >= now && !isExpired(expiryDate);
        });
    } else if (currentAuctionTab === 'ended') {
        products = products.filter(p => {
            const endDate = p.auction_end_date || p.auctionEndDate;
            const expiryDate = p.expiry_date || p.expiryDate;
            return isAuctionEnded(endDate) || isExpired(expiryDate);
        });
    } else if (currentAuctionTab === 'scheduled') {
        products = products.filter(p => {
            const startDate = new Date(p.auction_start_date || p.auctionStartDate || p.created_at || p.createdAt);
            return startDate > now;
        });
    }
    
    // 최신순으로 정렬
    products.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.parentElement.parentElement.style.display = 'none';
        if (noAuctions) noAuctions.style.display = 'block';
        return;
    }
    
    if (noAuctions) noAuctions.style.display = 'none';
    tbody.parentElement.parentElement.style.display = 'block';
    
    for (const product of products) {
        const status = getAuctionStatus(product);
        const bids = await getProductBids(product.id);
        const bidCount = bids.length;
        const highestBid = bids.length > 0 ? `${Math.max(...bids.map(b => b.amount)).toLocaleString()}원` : '-';
        const startDate = product.auction_start_date || product.auctionStartDate || product.created_at || product.createdAt;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.supplier_name || product.supplierName}</td>
            <td>${formatDate(product.expiry_date || product.expiryDate)}</td>
            <td>${formatDate(startDate)}</td>
            <td>${formatDate(product.auction_end_date || product.auctionEndDate)}</td>
            <td>${(product.min_price || product.minPrice).toLocaleString()}원</td>
            <td>${bidCount}건</td>
            <td>${highestBid}</td>
            <td><span class="product-status ${status.class}">${status.text}</span></td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn-primary btn-small" onclick="viewBids('${product.id}')">입찰내역</button>
                    <button class="btn btn-danger btn-small" onclick="deleteAuction('${product.id}')">삭제</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    }
}

async function deleteAuction(productId) {
    if (!confirm('정말 이 경매를 삭제하시겠습니까?')) {
        return;
    }
    
    await deleteProduct(productId);
    
    alert('경매가 삭제되었습니다.');
    await updateStats();
    await renderAuctions();
}

// ==================== 회원관리 탭 ====================
async function renderMembers() {
    const tbody = document.getElementById('admin-members-tbody');
    const noMembers = document.getElementById('no-members');
    
    if (!tbody) return;
    
    const members = await getMembers();
    
    tbody.innerHTML = '';
    
    if (members.length === 0) {
        tbody.parentElement.parentElement.style.display = 'none';
        if (noMembers) noMembers.style.display = 'block';
        return;
    }
    
    if (noMembers) noMembers.style.display = 'none';
    tbody.parentElement.parentElement.style.display = 'block';
    
    members.forEach(member => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${member.name}</td>
            <td>${member.email}</td>
            <td>${member.company || '-'}</td>
            <td>${member.phone || '-'}</td>
            <td>${member.type === 'supplier' ? '유통업체' : '매입업체'}</td>
            <td>${formatDate(member.created_at || member.createdAt)}</td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn-primary btn-small" onclick="editMember('${member.id}')">수정</button>
                    <button class="btn btn-danger btn-small" onclick="deleteMember('${member.id}')">삭제</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddMemberModal() {
    document.getElementById('member-modal-title').textContent = '회원 추가';
    document.getElementById('member-form').reset();
    document.getElementById('member-form').dataset.memberId = '';
    document.getElementById('member-modal').classList.add('show');
}

async function editMember(memberId) {
    const members = await getMembers();
    const member = members.find(m => m.id === memberId);
    
    if (!member) {
        alert('회원을 찾을 수 없습니다.');
        return;
    }
    
    document.getElementById('member-modal-title').textContent = '회원 수정';
    document.getElementById('member-name').value = member.name;
    document.getElementById('member-email').value = member.email;
    document.getElementById('member-company').value = member.company || '';
    document.getElementById('member-phone').value = member.phone || '';
    document.getElementById('member-type').value = member.type || 'buyer';
    document.getElementById('member-form').dataset.memberId = memberId;
    document.getElementById('member-modal').classList.add('show');
}

function closeMemberModal() {
    document.getElementById('member-modal').classList.remove('show');
    document.getElementById('member-form').reset();
}

async function deleteMember(memberId) {
    if (!confirm('정말 이 회원을 삭제하시겠습니까?')) {
        return;
    }
    
    // API에 회원 삭제 기능이 없으므로 LocalStorage 폴백 사용
    let members = await getMembers();
    members = members.filter(m => m.id !== memberId);
    // saveMembers는 api_client.js에 없으므로 LocalStorage 직접 사용
    localStorage.setItem('members', JSON.stringify(members));
    
    alert('회원이 삭제되었습니다.');
    await updateStats();
    await renderMembers();
}

// 회원 폼 제출 (비동기)
document.getElementById('member-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const memberId = this.dataset.memberId;
    const memberData = {
        name: document.getElementById('member-name').value,
        email: document.getElementById('member-email').value,
        company: document.getElementById('member-company').value,
        phone: document.getElementById('member-phone').value,
        type: document.getElementById('member-type').value
    };
    
    if (memberId) {
        // 수정 기능은 API에 없으므로 LocalStorage 사용
        let members = await getMembers();
        const index = members.findIndex(m => m.id === memberId);
        if (index !== -1) {
            members[index] = { ...members[index], ...memberData, updatedAt: new Date().toISOString() };
            localStorage.setItem('members', JSON.stringify(members));
        }
        alert('회원 정보가 수정되었습니다.');
    } else {
        // 회원 추가
        await addMember(memberData);
        alert('회원이 추가되었습니다.');
    }
    
    closeMemberModal();
    await updateStats();
    await renderMembers();
});

// ==================== 상품관리 탭 ====================
async function renderProducts() {
    const tbody = document.getElementById('admin-products-tbody');
    const noProducts = document.getElementById('no-products');
    
    if (!tbody) return;
    
    const products = await getProducts();
    
    tbody.innerHTML = '';
    
    if (products.length === 0) {
        tbody.parentElement.parentElement.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
        return;
    }
    
    if (noProducts) noProducts.style.display = 'none';
    tbody.parentElement.parentElement.style.display = 'block';
    
    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.supplier_name || product.supplierName}</td>
            <td>${product.quantity} ${product.unit || '개'}</td>
            <td>${(product.min_price || product.minPrice).toLocaleString()}원</td>
            <td>${formatDate(product.created_at || product.createdAt)}</td>
            <td>
                <div class="admin-actions">
                    <button class="btn btn-primary btn-small" onclick="editProduct('${product.id}')">수정</button>
                    <button class="btn btn-danger btn-small" onclick="deleteProductAdmin('${product.id}')">삭제</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function openAddProductModal() {
    document.getElementById('product-modal-title').textContent = '상품 추가';
    document.getElementById('product-form-admin').reset();
    document.getElementById('product-form-admin').dataset.productId = '';
    document.getElementById('product-modal').classList.add('show');
}

async function editProduct(productId) {
    const product = await getProductById(productId);
    
    if (!product) {
        alert('상품을 찾을 수 없습니다.');
        return;
    }
    
    document.getElementById('product-modal-title').textContent = '상품 수정';
    document.getElementById('admin-product-name').value = product.name;
    document.getElementById('admin-product-description').value = product.description || '';
    document.getElementById('admin-product-quantity').value = product.quantity;
    document.getElementById('admin-product-unit').value = product.unit || '';
    document.getElementById('admin-product-min-price').value = product.min_price || product.minPrice;
    document.getElementById('admin-product-supplier').value = product.supplier_name || product.supplierName;
    document.getElementById('product-form-admin').dataset.productId = productId;
    document.getElementById('product-modal').classList.add('show');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.remove('show');
    document.getElementById('product-form-admin').reset();
}

async function deleteProductAdmin(productId) {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) {
        return;
    }
    
    await deleteProduct(productId);
    
    alert('상품이 삭제되었습니다.');
    await updateStats();
    await renderProducts();
    await renderAuctions();
}

// 상품 폼 제출 (비동기)
document.getElementById('product-form-admin').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const productId = this.dataset.productId;
    
    const productData = {
        name: document.getElementById('admin-product-name').value,
        description: document.getElementById('admin-product-description').value,
        quantity: parseInt(document.getElementById('admin-product-quantity').value),
        unit: document.getElementById('admin-product-unit').value || '개',
        minPrice: parseInt(document.getElementById('admin-product-min-price').value),
        supplierName: document.getElementById('admin-product-supplier').value
    };
    
    if (productId) {
        // 수정 기능은 API에 없으므로 LocalStorage 사용
        const existingProduct = await getProductById(productId);
        if (existingProduct) {
            const updatedProduct = {
                ...existingProduct,
                ...productData,
                updatedAt: new Date().toISOString()
            };
            // LocalStorage 직접 업데이트 (API에 수정 기능 없음)
            let products = await getProducts();
            const index = products.findIndex(p => p.id === productId);
            if (index !== -1) {
                products[index] = updatedProduct;
                localStorage.setItem('products', JSON.stringify(products));
            }
        }
        alert('상품이 수정되었습니다.');
    } else {
        // 상품 추가
        const now = new Date();
        const product = {
            ...productData,
            expiryDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            auctionStartDate: now.toISOString(),
            auctionEndDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString()
        };
        await addProduct(product);
        alert('상품이 추가되었습니다.');
    }
    
    closeProductModal();
    await updateStats();
    await renderProducts();
    await renderAuctions();
});

// ==================== 배너관리 탭 ====================
async function renderBanners() {
    const container = document.getElementById('admin-banners-container');
    const noBanners = document.getElementById('no-banners');
    
    if (!container) return;
    
    const banners = (await getBanners()).sort((a, b) => (a.order_index || a.order || 0) - (b.order_index || b.order || 0));
    
    container.innerHTML = '';
    
    if (banners.length === 0) {
        container.style.display = 'none';
        if (noBanners) noBanners.style.display = 'block';
        return;
    }
    
    container.style.display = 'grid';
    if (noBanners) noBanners.style.display = 'none';
    
    banners.forEach(banner => {
        const bannerCard = document.createElement('div');
        bannerCard.className = 'banner-card';
        const isActive = banner.active === 1 || banner.active === true;
        const imageUrl = banner.image_url || banner.imageUrl;
        const order = banner.order_index || banner.order || 0;
        bannerCard.innerHTML = `
            <div class="banner-card-header">
                <h4>${banner.title}</h4>
                <span class="banner-status ${isActive ? 'active' : 'inactive'}">${isActive ? '활성' : '비활성'}</span>
            </div>
            <div class="banner-card-body">
                <p>${banner.description || ''}</p>
                <p class="banner-order">순서: ${order}</p>
                ${imageUrl ? `<img src="${imageUrl}" alt="${banner.title}" class="banner-preview">` : ''}
            </div>
            <div class="banner-card-actions">
                <button class="btn btn-primary btn-small" onclick="editBanner('${banner.id}')">수정</button>
                <button class="btn btn-danger btn-small" onclick="deleteBanner('${banner.id}')">삭제</button>
            </div>
        `;
        container.appendChild(bannerCard);
    });
}

function openAddBannerModal() {
    document.getElementById('banner-modal-title').textContent = '배너 추가';
    document.getElementById('banner-form').reset();
    document.getElementById('banner-order').value = getBanners().length + 1;
    document.getElementById('banner-active').checked = true;
    document.getElementById('banner-form').dataset.bannerId = '';
    document.getElementById('banner-modal').classList.add('show');
}

async function editBanner(bannerId) {
    const banners = await getBanners();
    const banner = banners.find(b => b.id === bannerId);
    
    if (!banner) {
        alert('배너를 찾을 수 없습니다.');
        return;
    }
    
    document.getElementById('banner-modal-title').textContent = '배너 수정';
    document.getElementById('banner-title').value = banner.title;
    document.getElementById('banner-description').value = banner.description || '';
    document.getElementById('banner-image-url').value = banner.image_url || banner.imageUrl || '';
    document.getElementById('banner-link').value = banner.link_url || banner.link || '';
    document.getElementById('banner-order').value = banner.order_index || banner.order || 0;
    document.getElementById('banner-active').checked = banner.active === 1 || banner.active === true;
    document.getElementById('banner-form').dataset.bannerId = bannerId;
    document.getElementById('banner-modal').classList.add('show');
}

function closeBannerModal() {
    document.getElementById('banner-modal').classList.remove('show');
    document.getElementById('banner-form').reset();
}

async function deleteBanner(bannerId) {
    if (!confirm('정말 이 배너를 삭제하시겠습니까?')) {
        return;
    }
    
    // API에 배너 삭제 기능이 없으므로 LocalStorage 사용
    let banners = await getBanners();
    banners = banners.filter(b => b.id !== bannerId);
    localStorage.setItem('banners', JSON.stringify(banners));
    
    alert('배너가 삭제되었습니다.');
    await renderBanners();
}

// 배너 폼 제출 (비동기)
document.getElementById('banner-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const bannerId = this.dataset.bannerId;
    const bannerData = {
        title: document.getElementById('banner-title').value,
        description: document.getElementById('banner-description').value,
        imageUrl: document.getElementById('banner-image-url').value,
        link: document.getElementById('banner-link').value,
        order: parseInt(document.getElementById('banner-order').value),
        active: document.getElementById('banner-active').checked
    };
    
    if (bannerId) {
        // 수정 기능은 API에 없으므로 LocalStorage 사용
        let banners = await getBanners();
        const index = banners.findIndex(b => b.id === bannerId);
        if (index !== -1) {
            banners[index] = { ...banners[index], ...bannerData, updatedAt: new Date().toISOString() };
            localStorage.setItem('banners', JSON.stringify(banners));
        }
        alert('배너가 수정되었습니다.');
    } else {
        // 배너 추가
        await addBanner(bannerData);
        alert('배너가 추가되었습니다.');
    }
    
    closeBannerModal();
    await renderBanners();
});

// ==================== 입찰 내역 보기 ====================
function viewBids(productId) {
    const products = getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('상품을 찾을 수 없습니다.');
        return;
    }
    
    const modal = document.getElementById('bids-modal');
    const container = document.getElementById('bids-list-container');
    
    if (!product.bids || product.bids.length === 0) {
        container.innerHTML = '<p>입찰 내역이 없습니다.</p>';
    } else {
        const sortedBids = [...product.bids].sort((a, b) => b.amount - a.amount);
        
        container.innerHTML = `
            <div style="margin-bottom: 20px;">
                <h3>${product.name}</h3>
                <p>총 ${sortedBids.length}건의 입찰</p>
            </div>
            <div class="bids-list">
                ${sortedBids.map((bid, index) => `
                    <div class="bid-item">
                        <div class="bid-item-info">
                            <div><strong>${index + 1}위</strong> - ${bid.bidderName}</div>
                            <div style="font-size: 12px; color: #666; margin-top: 5px;">
                                ${formatDate(bid.timestamp)}
                            </div>
                        </div>
                        <div class="bid-item-amount">${bid.amount.toLocaleString()}원</div>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    modal.classList.add('show');
}

function closeBidsModal() {
    document.getElementById('bids-modal').classList.remove('show');
}

// ==================== 관리자 로그인 확인 ====================
function checkAdminLogin() {
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || sessionStorage.getItem('adminUser') || 'null');
    if (!adminUser || adminUser.type !== 'admin') {
        return false;
    }
    return true;
}

// ==================== 모달 외부 클릭 시 닫기 ====================
window.onclick = function(event) {
    const modals = ['bids-modal', 'member-modal', 'product-modal', 'banner-modal'];
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (event.target === modal) {
            if (modalId === 'bids-modal') closeBidsModal();
            else if (modalId === 'member-modal') closeMemberModal();
            else if (modalId === 'product-modal') closeProductModal();
            else if (modalId === 'banner-modal') closeBannerModal();
        }
    });
}

// ==================== 페이지 로드 시 초기화 ====================
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminLogin()) {
        return;
    }
    
    updateStats();
    renderAuctions();
    
    // 통계를 주기적으로 업데이트
    setInterval(() => {
        if (checkAdminLogin()) {
            updateStats();
            if (currentMainTab === 'auctions') {
                renderAuctions();
            }
        }
    }, 1000);
});
