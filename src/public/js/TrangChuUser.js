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