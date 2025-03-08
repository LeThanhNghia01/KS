// src/public/js/PhongUser/phongUserManager.js
const PhongUserManager = {
    currentPage: 1,
    totalPages: 1,
    roomsPerPage: 9,
    loaiPhongList: [],
    
    // Khởi tạo
    init() {
        // Load các thành phần
        this.loadLoaiPhong();
        this.loadRooms();
        
        // Xử lý sự kiện
        this.setupEventListeners();
        
        // Xử lý bộ lọc giá
        const priceFilter = document.getElementById('priceFilter');
        const priceValue = document.getElementById('priceValue');
        if (priceFilter && priceValue) {
            priceFilter.addEventListener('input', function() {
                const value = new Intl.NumberFormat('vi-VN').format(this.value);
                priceValue.textContent = `${value}đ`;
            });
        }
    },
    
    // Thiết lập các sự kiện
    setupEventListeners() {
        // Sự kiện search
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('searchRoom');
        
        if (searchBtn && searchInput) {
            searchBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.loadRooms();
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.currentPage = 1;
                    this.loadRooms();
                }
            });
        }
        
        // Sự kiện bộ lọc
        const applyFilterBtn = document.getElementById('applyFilter');
        if (applyFilterBtn) {
            applyFilterBtn.addEventListener('click', () => {
                this.currentPage = 1;
                this.loadRooms();
            });
        }
        
        // Sự kiện đặt phòng
        const bookNowBtn = document.getElementById('bookNowBtn');
        if (bookNowBtn) {
            bookNowBtn.addEventListener('click', () => {
                const roomId = bookNowBtn.getAttribute('data-room-id');
                if (roomId) {
                    // Kiểm tra người dùng đã đăng nhập chưa
                    const isLoggedIn = localStorage.getItem('user') !== null;
                    
                    if (isLoggedIn) {
                        window.location.href = `/dat-phong?phongId=${roomId}`;
                    } else {
                        alert('Vui lòng đăng nhập để đặt phòng');
                        window.location.href = '/dang-nhap?redirect=' + encodeURIComponent(`/dat-phong?phongId=${roomId}`);
                    }
                }
            });
        }
    },
    
    // Load danh sách loại phòng
    async loadLoaiPhong() {
        try {
            const response = await fetch('/api/loai-phong/list');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            
            if (result.success) {
                this.loaiPhongList = result.data;
                
                // Render vào dropdown
                const loaiPhongFilter = document.getElementById('loaiPhongFilter');
                if (loaiPhongFilter) {
                    loaiPhongFilter.innerHTML = '<option value="">Tất cả</option>';
                    
                    this.loaiPhongList.forEach(loai => {
                        const option = document.createElement('option');
                        option.value = loai.IDLoai;
                        option.textContent = loai.TenLoai;
                        loaiPhongFilter.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error loading room types:', error);
        }
    },
    
    // Load danh sách phòng
    async loadRooms() {
        try {
            // Hiển thị loading
            const roomContainer = document.getElementById('roomContainer');
            if (!roomContainer) {
                console.error('Không tìm thấy phần tử roomContainer');
                return;
            }
            
            const loadingElement = document.getElementById('loadingRooms');
            const noRoomsElement = document.getElementById('noRooms');
            if (roomContainer && loadingElement) {
                // Xóa nội dung cũ và hiển thị loading
                Array.from(roomContainer.children).forEach(child => {
                    if (child !== loadingElement && child !== noRoomsElement) {
                        child.remove();
                    }
                });
                
                loadingElement.classList.remove('d-none');
                if (noRoomsElement) noRoomsElement.classList.add('d-none');
            }
            
            // Lấy các tham số lọc
            const searchValue = document.getElementById('searchRoom')?.value || '';
            const loaiPhongValue = document.getElementById('loaiPhongFilter')?.value || '';
            const maxPriceValue = document.getElementById('priceFilter')?.value || '';
            
            // Tạo query string
            const queryParams = new URLSearchParams({
                page: this.currentPage,
                limit: this.roomsPerPage,
                search: searchValue,
                loaiPhong: loaiPhongValue,
                maxPrice: maxPriceValue
            });
            
            // Gọi API
            const response = await fetch(`/api/phong?${queryParams}`);/////////////////
            if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();

            if (result.success) {
                // Cập nhật thông tin phân trang
                this.totalPages = result.pagination.lastPage;
                
                // Ẩn loading
                if (loadingElement) loadingElement.classList.add('d-none');
                
                // Kiểm tra nếu không có phòng
                if (result.data.length === 0) {
                    if (noRoomsElement) noRoomsElement.classList.remove('d-none');
                    this.renderPagination();
                    return;
                }
                
                // Render phòng
                this.renderRooms(result.data);
                
                // Render phân trang
                this.renderPagination();
            }
        } catch (error) {
            console.error('Error loading rooms:', error);
            
            // Ẩn loading và hiển thị thông báo lỗi
            const loadingElement = document.getElementById('loadingRooms');
            if (loadingElement) loadingElement.classList.add('d-none');
            
            const roomContainer = document.getElementById('roomContainer');
            if (roomContainer) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'col-12 text-center py-5';
                errorMsg.innerHTML = `
                    <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                    <h4>Đã xảy ra lỗi</h4>
                    <p>Không thể tải danh sách phòng. Vui lòng thử lại sau.</p>
                `;
                roomContainer.appendChild(errorMsg);
            }
        }
    },
    
    // Render danh sách phòng
    renderRooms(rooms) {
        const roomContainer = document.getElementById('roomContainer');
        if (!roomContainer) return;
        
        rooms.forEach(room => {
            const priceFormatted = new Intl.NumberFormat('vi-VN').format(room.Gia);
            
            // Lấy ảnh đầu tiên hoặc ảnh mặc định
            const imageUrl = room.anhPhong && room.anhPhong.length > 0 
                ? room.anhPhong[0] 
                : '../../public/images/default-room.jpg';
            
            // Tạo card cho mỗi phòng
            const roomCard = document.createElement('div');
            roomCard.className = 'col-md-4 mb-4';
            roomCard.innerHTML = `
                <div class="card h-100 room-card">
                    <div class="room-image">
                        <img src="${imageUrl}" class="card-img-top" alt="${room.TenLoai}">
                      
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${room.TenLoai}</h5>
                        <p class="card-text text-primary fw-bold">${priceFormatted}đ / đêm</p>
                        <div class="room-amenities">
                            <span class="badge bg-light text-dark me-1"><i class="fas fa-wifi"></i> Wi-Fi</span>
                            <span class="badge bg-light text-dark me-1"><i class="fas fa-snowflake"></i> Điều hòa</span>
                            <span class="badge bg-light text-dark"><i class="fas fa-tv"></i> TV</span>
                        </div>
                    </div>
                    <div class="card-footer bg-white border-top-0">
                        <button class="btn btn-outline-primary w-100 room-detail-btn" data-room-id="${room.PhongID}">
                            Xem chi tiết
                        </button>
                    </div>
                </div>
            `;
            
            roomContainer.appendChild(roomCard);
            
            // Thêm sự kiện cho nút xem chi tiết
            const detailBtn = roomCard.querySelector('.room-detail-btn');
            if (detailBtn) {
                detailBtn.addEventListener('click', () => {
                    this.viewRoomDetail(room.PhongID);
                });
            }
        });
    },
    
    // Xem chi tiết phòng
    async viewRoomDetail(roomId) {
        try {
            // Hiển thị modal
            const roomDetailModal = new bootstrap.Modal(document.getElementById('roomDetailModal'));
            roomDetailModal.show();
            
            // Reset modal body và hiển thị loading
            const modalBody = document.getElementById('modalBody');
            if (modalBody) {
                modalBody.innerHTML = `
                    <div class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Đang tải...</span>
                        </div>
                    </div>
                `;
            }
            
            // Set room ID for booking button
            const bookNowBtn = document.getElementById('bookNowBtn');
            if (bookNowBtn) {
                bookNowBtn.setAttribute('data-room-id', roomId);
            }
            
            // Gọi API lấy chi tiết phòng
            const response = await fetch(`/api/phong/${roomId}`);
            const result = await response.json();
            
            if (result.success) {
                const room = result.data;
                const priceFormatted = new Intl.NumberFormat('vi-VN').format(room.Gia);
                
                // Tạo danh sách ảnh
                let imagesHtml = '';
                if (room.anhPhong && room.anhPhong.length > 0) {
                    imagesHtml = `
                        <div id="roomImagesCarousel" class="carousel slide mb-4" data-bs-ride="carousel">
                            <div class="carousel-indicators">
                                ${room.anhPhong.map((_, index) => `
                                    <button type="button" data-bs-target="#roomImagesCarousel" 
                                        data-bs-slide-to="${index}" 
                                        ${index === 0 ? 'class="active"' : ''}
                                        aria-label="Slide ${index + 1}">
                                    </button>
                                `).join('')}
                            </div>
                            <div class="carousel-inner">
                                ${room.anhPhong.map((img, index) => `
                                    <div class="carousel-item ${index === 0 ? 'active' : ''}">
                                        <img src="${img}" class="d-block w-100" alt="Room image ${index + 1}">
                                    </div>
                                `).join('')}
                            </div>
                            <button class="carousel-control-prev" type="button" data-bs-target="#roomImagesCarousel" data-bs-slide="prev">
                                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span class="visually-hidden">Previous</span>
                                <span class="visually-hidden">Next</span>
                                </button>
                            </div>
                        `;
                    }
    
                    // Tạo nội dung chi tiết phòng
                    const roomDetailHtml = `
                        <div class="row">
                            <div class="col-md-6">
                                ${imagesHtml}
                            </div>
                            <div class="col-md-6">
                                <h4>${room.TenLoai}</h4>
                                <p class="text-primary fw-bold">${priceFormatted}đ / đêm</p>
                                <p>Trạng thái: <span class="badge ${room.TenTinhTrang === 'Trống' ? 'bg-success' : 'bg-danger'}">${room.TenTinhTrang}</span></p>
                                <h5>Tiện nghi</h5>
                                <ul>
                                    <li><i class="fas fa-wifi"></i> Wi-Fi miễn phí</li>
                                    <li><i class="fas fa-snowflake"></i> Điều hòa</li>
                                    <li><i class="fas fa-tv"></i> TV màn hình phẳng</li>
                                    <li><i class="fas fa-shower"></i> Phòng tắm riêng</li>
                                </ul>
                                <h5>Mô tả</h5>
                                <p>Phòng ${room.TenLoai} với đầy đủ tiện nghi, view đẹp, phù hợp cho kỳ nghỉ dưỡng của bạn.</p>
                            </div>
                        </div>
                    `;
    
                    // Cập nhật nội dung modal
                    modalBody.innerHTML = roomDetailHtml;
                }
            } catch (error) {
                console.error('Error fetching room details:', error);
    
                // Hiển thị thông báo lỗi
                const modalBody = document.getElementById('modalBody');
                if (modalBody) {
                    modalBody.innerHTML = `
                        <div class="text-center py-4">
                            <i class="fas fa-exclamation-triangle fa-3x text-warning mb-3"></i>
                            <h4>Đã xảy ra lỗi</h4>
                            <p>Không thể tải thông tin phòng. Vui lòng thử lại sau.</p>
                        </div>
                    `;
                }
            }
        },
    
        // Render phân trang
        renderPagination() {
            const pagination = document.getElementById('pagination');
            if (!pagination) return;
    
            // Xóa nội dung cũ
            pagination.innerHTML = '';
    
            // Tạo nút Previous
            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Previous" ${this.currentPage === 1 ? 'tabindex="-1"' : ''}>
                    <span aria-hidden="true">&laquo;</span>
                </a>
            `;
            prevLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.loadRooms();
                }
            });
            pagination.appendChild(prevLi);
    
            // Tạo các nút trang
            for (let i = 1; i <= this.totalPages; i++) {
                const pageLi = document.createElement('li');
                pageLi.className = `page-item ${this.currentPage === i ? 'active' : ''}`;
                pageLi.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                pageLi.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.currentPage = i;
                    this.loadRooms();
                });
                pagination.appendChild(pageLi);
            }
    
            // Tạo nút Next
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `
                <a class="page-link" href="#" aria-label="Next" ${this.currentPage === this.totalPages ? 'tabindex="-1"' : ''}>
                    <span aria-hidden="true">&raquo;</span>
                </a>
            `;
            nextLi.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.loadRooms();
                }
            });
            pagination.appendChild(nextLi);
        }
    };