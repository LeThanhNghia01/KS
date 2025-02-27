document.addEventListener('DOMContentLoaded', function() {
    class StickyNavigation {
        constructor() {
            this.currentId = null;
            this.currentTab = null;
            this.tabContainerHeight = 70;
            this.lastScrollTop = 0;
            this.bindEvents();
            // Set initial active tab
            setTimeout(() => {
                this.findCurrentTabSelector();
                this.setSliderCss();
            }, 100);
        }

        bindEvents() {
            const self = this;
            const tabs = document.querySelectorAll('.et-hero-tab');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', function(event) {
                    self.onTabClick(event, this);
                });
            });

            // Throttle scroll event for better performance
            let ticking = false;
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.onScroll();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            window.addEventListener('resize', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.onResize();
                        ticking = false;
                    });
                    ticking = true;
                }
            });
        }

        onTabClick(event, element) {
            event.preventDefault();
            const targetId = element.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;

            // Update active tab immediately on click
            this.currentTab = element;
            this.currentId = targetId;
            this.setSliderCss();

            const scrollTop = targetElement.offsetTop - this.tabContainerHeight;
            window.scrollTo({
                top: scrollTop,
                behavior: 'smooth'
            });
        }

        onScroll() {
            // Get the middle of the viewport
            const viewportMiddle = window.pageYOffset + (window.innerHeight / 2);
            this.findCurrentTabSelector(viewportMiddle);
        }

        onResize() {
            if(this.currentId) {
                this.setSliderCss();
            }
        }

        findCurrentTabSelector(viewportMiddle) {
            const sections = document.querySelectorAll('.et-slide');
            let currentSection = null;
            
            // Find which section is currently in view
            sections.forEach(section => {
                const sectionTop = section.offsetTop - this.tabContainerHeight;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (window.pageYOffset >= sectionTop && window.pageYOffset < sectionBottom) {
                    currentSection = section;
                }
            });

            if (currentSection) {
                const newCurrentId = `#${currentSection.id}`;
                const newCurrentTab = document.querySelector(`a[href="${newCurrentId}"]`);

                if (this.currentId !== newCurrentId) {
                    this.currentId = newCurrentId;
                    this.currentTab = newCurrentTab;
                    this.setSliderCss();
                }
            }
        }

        setSliderCss() {
            const slider = document.querySelector('.et-hero-tab-slider');
            if (!this.currentTab || !slider) return;

            const width = this.currentTab.offsetWidth;
            const left = this.currentTab.offsetLeft;

            slider.style.width = `${width}px`;
            slider.style.left = `${left}px`;
            slider.style.transform = 'none'; // Reset any transforms
        }
    }

    new StickyNavigation();
});
//slide
  //Khởi tạo các biến cần thiết.
  document.addEventListener('DOMContentLoaded', function() {
    const slides = document.querySelectorAll('.slide');//Lấy tất cả các phần tử có class .slide (các slide chính).
    const slideInfos = document.querySelectorAll('.slide-info');//Lấy tất cả các phần tử có class .slide-info (các thông tin của slide).
    const slideBgs = document.querySelectorAll('.slide__bg');
    const prevButton = document.querySelector('.slider--btn__prev');
    const nextButton = document.querySelector('.slider--btn__next');
    let currentIndex = 0;//Biến lưu vị trí hiện tại của slide đang hiển thị.
    //hiển thị slide hiện tại và thiết lập trạng thái cho các slide
    function showSlide(index) {
        slides.forEach((slide, i) => {
            if (i === index) {//Nếu vị trí hiện tại của slide đang hiển thị bằng với vị trí của slide cần hiển thị thì hiển thị slide đó.
                slide.setAttribute('data-current', '');
                slide.removeAttribute('data-next');
                slide.removeAttribute('data-previous');
                
            } else if (i === (index + 1) % slides.length) {
                slide.setAttribute('data-next', '');
                slide.removeAttribute('data-current');
                slide.removeAttribute('data-previous');
            } else if (i === (index - 1 + slides.length) % slides.length) {
                slide.setAttribute('data-previous', '');
                slide.removeAttribute('data-current');
                slide.removeAttribute('data-next');
            } else {
                slide.removeAttribute('data-current');
                slide.removeAttribute('data-next');
                slide.removeAttribute('data-previous');
            }
        });
        //Ví Dụ
        // index = 0: slide 0 → data-current, slide 1 → data-next, slide 2 → data-previous.
        // index = 1: slide 1 → data-current, slide 2 → data-next, slide 0 → data-previous.
        // index = 2: slide 2 → data-current, slide 0 → data-next, slide 1 → data-previous.
        slideBgs.forEach((bg, i) => {
            if (i === index) {
                bg.setAttribute('data-current', '');
                bg.removeAttribute('data-next');
                bg.removeAttribute('data-previous');
            } else if (i === (index + 1) % slideBgs.length) {
                bg.setAttribute('data-next', '');
                bg.removeAttribute('data-current');
                bg.removeAttribute('data-previous');
            } else if (i === (index - 1 + slideBgs.length) % slideBgs.length) {
                bg.setAttribute('data-previous', '');
                bg.removeAttribute('data-current');
                bg.removeAttribute('data-next');
            } else {
                bg.removeAttribute('data-current');
                bg.removeAttribute('data-next');
                bg.removeAttribute('data-previous');
            }
        });
        slideInfos.forEach((slideInfo, i) => {
            if (i === index) {
                slideInfo.setAttribute('data-current', '');
                slideInfo.removeAttribute('data-next');
                slideInfo.removeAttribute('data-previous');
            } else if (i === (index + 1) % slideInfos.length) {
                slideInfo.setAttribute('data-next', '');
                slideInfo.removeAttribute('data-current');
                slideInfo.removeAttribute('data-previous');
            } else if (i === (index - 1 + slideInfos.length) % slideInfos.length) {
                slideInfo.setAttribute('data-previous', '');
                slideInfo.removeAttribute('data-current');
                slideInfo.removeAttribute('data-next');
            } else {
                slideInfo.removeAttribute('data-current');
                slideInfo.removeAttribute('data-next');
                slideInfo.removeAttribute('data-previous');
            }
        });
    }
    //xử lý nút previous
    prevButton.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        showSlide(currentIndex);
    });
    //xử lý nút next
    nextButton.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    });
   //Khởi tạo slide đầu tiên
    showSlide(currentIndex);
});