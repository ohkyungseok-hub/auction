// 상품 데이터 관리 (데이터베이스 API 사용)
// api_client.js가 로드되어 있어야 합니다

// 카운트다운 계산
function getTimeRemaining(endDate) {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const difference = end - now;

    if (difference <= 0) {
        return { ended: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { ended: false, days, hours, minutes, seconds };
}

// 시간 포맷팅
function formatTimeRemaining(time) {
    if (time.ended) {
        return '경매 종료';
    }
    
    const parts = [];
    if (time.days > 0) parts.push(`${time.days}일`);
    if (time.hours > 0) parts.push(`${time.hours}시간`);
    if (time.minutes > 0) parts.push(`${time.minutes}분`);
    parts.push(`${time.seconds}초`);
    
    return parts.join(' ');
}

// 날짜 포맷팅
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

// 상품 카드 생성
function createProductCard(product) {
    const auctionEndDate = product.auction_end_date || product.auctionEndDate;
    const expiryDateStr = product.expiry_date || product.expiryDate;
    const timeRemaining = getTimeRemaining(auctionEndDate);
    const isEnded = timeRemaining.ended;
    const expiryDate = new Date(expiryDateStr);
    const isExpired = expiryDate < new Date();
    
    const card = document.createElement('div');
    card.className = `product-card ${isExpired ? 'expired' : ''} ${isEnded ? 'ended' : ''}`;
    
    let statusClass = 'status-ended';
    let statusText = '종료됨';
    
    if (!isEnded && !isExpired) {
        statusClass = 'status-active';
        statusText = '진행 중';
    } else if (isExpired) {
        statusClass = 'status-expired';
        statusText = '유통기한 만료';
    }
    
    const bids = product.bids || [];
    const bidCount = bids.length;
    const highestBid = bids.length > 0 
        ? Math.max(...bids.map(b => b.amount || b.amount))
        : null;
    
    card.innerHTML = `
        <div class="product-header">
            <div class="product-name">${product.name}</div>
            <span class="product-status ${statusClass}">${statusText}</span>
        </div>
        <div class="product-info">
            <div class="product-info-item">
                <span class="product-info-label">유통업체</span>
                <span class="product-info-value">${product.supplier_name || product.supplierName}</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">유통기한</span>
                <span class="product-info-value">${formatDate(product.expiry_date || product.expiryDate)}</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">수량</span>
                <span class="product-info-value">${product.quantity} ${product.unit || '개'}</span>
            </div>
            <div class="product-info-item">
                <span class="product-info-label">최저가</span>
                <span class="product-info-value">${(product.min_price || product.minPrice).toLocaleString()}원</span>
            </div>
            ${product.description ? `
            <div class="product-info-item">
                <span class="product-info-label">설명</span>
                <span class="product-info-value">${product.description}</span>
            </div>
            ` : ''}
        </div>
        <div class="countdown ${isEnded ? 'ended' : ''}">
            <div class="countdown-label">경매 종료까지</div>
            <div class="countdown-time">${formatTimeRemaining(timeRemaining)}</div>
        </div>
        <div class="bid-info">
            <div class="bid-count">
                입찰: <strong>${bidCount}</strong>건
            </div>
            <button class="btn btn-primary" onclick="openBidModal('${product.id}')" ${isEnded || isExpired ? 'disabled' : ''}>
                입찰하기
            </button>
        </div>
    `;
    
    return card;
}

// 상품 목록 렌더링 (비동기)
async function renderProducts() {
    const container = document.getElementById('products-container');
    const noProducts = document.getElementById('no-products');
    
    if (!container) return;
    
    // 데이터베이스에서 상품 가져오기
    let products = await getProducts();
    
    // 진행 중인 경매만 필터링 (선택사항: 종료된 것도 보여주려면 이 부분 제거)
    // products = products.filter(p => !getTimeRemaining(p.auctionEndDate).ended);
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.style.display = 'none';
        if (noProducts) noProducts.style.display = 'block';
        return;
    }
    
    if (noProducts) noProducts.style.display = 'none';
    container.style.display = 'grid';
    
    // 최신순으로 정렬
    products.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    
    // 입찰 정보를 각 상품에 추가
    for (const product of products) {
        if (!product.bids) {
            const bids = await getProductBids(product.id);
            product.bids = bids;
        }
        const card = createProductCard(product);
        container.appendChild(card);
    }
    
    // 카운트다운 업데이트를 위해 1초마다 다시 렌더링
    setTimeout(() => {
        renderProducts();
    }, 1000);
}

// 입찰 모달 열기 (비동기)
async function openBidModal(productId) {
    // 로그인 확인
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) {
        if (confirm('로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?')) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    const modal = document.getElementById('bid-modal');
    const productInfo = document.getElementById('bid-product-info');
    const minPriceHint = document.getElementById('min-price-hint');
    const bidAmount = document.getElementById('bid-amount');
    const bidderNameInput = document.getElementById('bidder-name');
    
    // 데이터베이스에서 상품 가져오기
    const product = await getProductById(productId);
    
    if (!product) {
        alert('상품을 찾을 수 없습니다.');
        return;
    }
    
    productInfo.innerHTML = `
        <h3>${product.name}</h3>
        <p>유통업체: ${product.supplier_name || product.supplierName}</p>
        <p>수량: ${product.quantity} ${product.unit || '개'}</p>
        <p>최저가: ${(product.min_price || product.minPrice).toLocaleString()}원</p>
        <p>유통기한: ${formatDate(product.expiry_date || product.expiryDate)}</p>
    `;
    
    const minPrice = product.min_price || product.minPrice;
    minPriceHint.textContent = `최저가: ${minPrice.toLocaleString()}원 이상 입찰해주세요.`;
    bidAmount.min = minPrice;
    bidAmount.value = '';
    
    // 로그인한 사용자 정보 자동 입력
    if (bidderNameInput) {
        bidderNameInput.value = currentUser.name || currentUser.email.split('@')[0] || '';
    }
    
    // 폼에 productId 저장
    document.getElementById('bid-form').dataset.productId = productId;
    
    modal.classList.add('show');
}

// 입찰 모달 닫기
function closeBidModal() {
    const modal = document.getElementById('bid-modal');
    modal.classList.remove('show');
    document.getElementById('bid-form').reset();
}

// 입찰 처리 (비동기)
async function handleBidSubmit(e) {
    e.preventDefault();
    
    const productId = e.target.dataset.productId;
    const bidderName = document.getElementById('bidder-name').value.trim();
    const bidAmount = parseInt(document.getElementById('bid-amount').value);
    
    if (!bidderName) {
        alert('입찰자명을 입력해주세요.');
        return;
    }
    
    if (!bidAmount || bidAmount <= 0) {
        alert('올바른 입찰 금액을 입력해주세요.');
        return;
    }
    
    // 데이터베이스에서 상품 가져오기
    const product = await getProductById(productId);
    
    if (!product) {
        alert('상품을 찾을 수 없습니다.');
        return;
    }
    
    const auctionEndDate = product.auction_end_date || product.auctionEndDate;
    
    // 경매 종료 확인
    if (getTimeRemaining(auctionEndDate).ended) {
        alert('이미 종료된 경매입니다.');
        closeBidModal();
        renderProducts();
        return;
    }
    
    const minPrice = product.min_price || product.minPrice;
    
    // 최저가 확인
    if (bidAmount < minPrice) {
        alert(`최저가(${minPrice.toLocaleString()}원) 이상으로 입찰해주세요.`);
        return;
    }
    
    // 로그인한 사용자 정보 가져오기
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    
    const bid = {
        bidderName: bidderName,
        bidderEmail: currentUser ? currentUser.email : '',
        amount: bidAmount
    };
    
    // 데이터베이스에 입찰 추가
    await addBid(productId, bid);
    
    alert('입찰이 완료되었습니다!');
    closeBidModal();
    renderProducts();
}

// 모달 외부 클릭 시 닫기
window.onclick = function(event) {
    const modal = document.getElementById('bid-modal');
    if (event.target === modal) {
        closeBidModal();
    }
}

// 로그인 상태 확인 및 업데이트
function updateLoginStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || 'null');
    const loginBtn = document.getElementById('login-btn');
    const userIcon = document.getElementById('user-icon');
    
    if (currentUser && loginBtn) {
        loginBtn.textContent = currentUser.name || '로그아웃';
        loginBtn.href = '#';
        loginBtn.onclick = function() {
            localStorage.removeItem('currentUser');
            sessionStorage.removeItem('currentUser');
            window.location.reload();
        };
    }
}

// 검색 기능
function initSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const query = e.target.value.toLowerCase();
            const products = getProducts();
            const filtered = products.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.supplierName.toLowerCase().includes(query)
            );
            
            // 검색 결과 렌더링 (간단한 구현)
            if (query) {
                // 검색 기능은 필요시 확장 가능
            } else {
                renderProducts();
            }
        });
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 로그인 상태 업데이트
    updateLoginStatus();
    
    // 검색 기능 초기화
    initSearch();
    
    // 입찰 폼 이벤트 리스너
    const bidForm = document.getElementById('bid-form');
    if (bidForm) {
        bidForm.addEventListener('submit', handleBidSubmit);
    }
    
    // 닫기 버튼 이벤트 리스너
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeBidModal);
    }
    
    // 상품 목록 렌더링
    renderProducts();
});
