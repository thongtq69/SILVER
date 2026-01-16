/**
 * Avalane & Co - Shopify Theme JavaScript
 * Enhanced for Australian Market
 */

(function () {
  'use strict';

  // DOM Ready
  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initProductGallery();
    initQuantitySelectors();
    initAddToCart();
    initCartRemove();
    initProductTracking();
    initScrollAnimations();
    initQuickView();
  });

  /**
   * Mobile Menu Toggle with Animations
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const body = document.body;

    if (!toggle || !mobileMenu) return;

    // Add styles for hamburger animation
    toggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);

      // Toggle hamburger animation
      toggle.classList.toggle('is-active', isOpen);

      // Prevent body scroll when menu is open
      body.style.overflow = isOpen ? 'hidden' : '';

      // Animate menu items
      if (isOpen) {
        animateMenuItems();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        closeMobileMenu();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
      }
    });

    function closeMobileMenu() {
      mobileMenu.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      toggle.classList.remove('is-active');
      body.style.overflow = '';
    }

    function animateMenuItems() {
      const items = mobileMenu.querySelectorAll('.mobile-nav-item');
      items.forEach((item, index) => {
        item.style.animationDelay = (index * 0.05) + 's';
        item.classList.add('animate-in');
      });
    }
  }

  /**
   * Product Gallery - Thumbnail Navigation
   */
  function initProductGallery() {
    const mainImage = document.getElementById('ProductMainImage');
    const thumbnails = document.querySelectorAll('.thumbnail-btn');

    if (!mainImage || !thumbnails.length) return;

    thumbnails.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        const newSrc = this.dataset.image;
        if (newSrc) {
          // Fade transition
          mainImage.style.opacity = '0';
          setTimeout(() => {
            mainImage.src = newSrc;
            mainImage.style.opacity = '1';
          }, 200);

          // Update active state
          thumbnails.forEach(t => t.classList.remove('active'));
          this.classList.add('active');
        }
      });
    });
  }

  /**
   * Quantity Selectors
   */
  function initQuantitySelectors() {
    const selectors = document.querySelectorAll('.quantity-selector');

    selectors.forEach(function (selector) {
      const input = selector.querySelector('.quantity-input');
      const minusBtn = selector.querySelector('.quantity-minus, .quantity-btn[data-action="decrease"]');
      const plusBtn = selector.querySelector('.quantity-plus, .quantity-btn[data-action="increase"]');

      if (!input) return;

      if (minusBtn) {
        minusBtn.addEventListener('click', function () {
          const currentValue = parseInt(input.value) || 1;
          const min = parseInt(input.min) || 1;
          if (currentValue > min) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }

      if (plusBtn) {
        plusBtn.addEventListener('click', function () {
          const currentValue = parseInt(input.value) || 1;
          const max = parseInt(input.max) || 99;
          if (currentValue < max) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
    });
  }

  /**
   * Add to Cart with AJAX - English for Australian Market
   */
  function initAddToCart() {
    const forms = document.querySelectorAll('.product-form, form[action="/cart/add"]');

    forms.forEach(function (form) {
      if (form.closest('.cart-page')) return;

      form.addEventListener('submit', function (e) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (!submitBtn) return;

        // Buy Now button should go to checkout
        if (document.activeElement.classList.contains('btn-buy-now')) {
          return;
        }

        e.preventDefault();

        const formData = new FormData(form);

        // Disable button and show loading state
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Adding...</span>';

        fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        })
          .then(response => response.json())
          .then(data => {
            submitBtn.innerHTML = '<span>Added ✓</span>';
            submitBtn.classList.add('btn-success');

            // Update cart count
            updateCartCount();

            // Show success animation
            showCartNotification(data);

            // Reset button after 2 seconds
            setTimeout(function () {
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalText;
              submitBtn.classList.remove('btn-success');
            }, 2000);
          })
          .catch(error => {
            console.error('Error:', error);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
            showNotification('An error occurred. Please try again.', 'error');
          });
      });
    });
  }

  /**
   * Show Cart Notification
   */
  function showCartNotification(product) {
    let notification = document.getElementById('cart-notification');

    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'cart-notification';
      notification.className = 'cart-notification';
      notification.innerHTML = `
        <div class="cart-notification-content">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#28a745" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Added to cart!</span>
        </div>
      `;
      document.body.appendChild(notification);
    }

    notification.classList.add('show');

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  /**
   * Show Generic Notification
   */
  function showNotification(message, type = 'info') {
    let notification = document.getElementById('generic-notification');

    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'generic-notification';
      notification.className = 'generic-notification';
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.className = `generic-notification ${type} show`;

    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }

  /**
   * Cart Item Removal
   */
  function initCartRemove() {
    const removeButtons = document.querySelectorAll('.cart-item-remove');

    removeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const line = this.dataset.line;
        if (!line) return;

        const item = this.closest('.cart-item');
        if (item) {
          item.style.opacity = '0.5';
          item.style.pointerEvents = 'none';
        }

        fetch('/cart/change.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            line: parseInt(line),
            quantity: 0
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.item_count === 0) {
              location.reload();
            } else {
              if (item) item.remove();
              updateCartTotal(data);
              updateCartCount();
            }
          })
          .catch(error => {
            console.error('Error:', error);
            if (item) {
              item.style.opacity = '1';
              item.style.pointerEvents = 'auto';
            }
          });
      });
    });
  }

  /**
   * Update Cart Count in Header
   */
  function updateCartCount() {
    fetch('/cart.js')
      .then(response => response.json())
      .then(cart => {
        const countElements = document.querySelectorAll('.cart-count');
        countElements.forEach(function (el) {
          if (cart.item_count > 0) {
            el.textContent = cart.item_count;
            el.style.display = 'flex';
          } else {
            el.style.display = 'none';
          }
        });
      });
  }

  /**
   * Update Cart Totals - Australian Dollar
   */
  function updateCartTotal(cart) {
    const subtotalEl = document.querySelector('.cart-subtotal-price');
    if (subtotalEl && cart.total_price !== undefined) {
      subtotalEl.textContent = formatMoney(cart.total_price);
    }
  }

  /**
   * Format Money (Australian Dollar)
   */
  function formatMoney(cents) {
    const amount = (cents / 100).toFixed(2);
    return '$' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  /**
   * Product View Tracking for Recently Viewed
   */
  function initProductTracking() {
    const productData = document.querySelector('[data-product-json]');

    if (!productData) return;

    try {
      const product = JSON.parse(productData.textContent);

      if (product && product.id) {
        trackProductView({
          id: product.id,
          title: product.title,
          url: window.location.pathname,
          image: product.featured_image || product.images?.[0] || '',
          price: formatMoney(product.price)
        });
      }
    } catch (e) {
      console.error('Error tracking product:', e);
    }
  }

  /**
   * Track Product View
   */
  function trackProductView(product) {
    const maxItems = 10;
    let recentlyViewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');

    // Remove if already exists
    recentlyViewed = recentlyViewed.filter(p => p.id !== product.id);

    // Add to beginning
    recentlyViewed.unshift(product);

    // Limit array size
    recentlyViewed = recentlyViewed.slice(0, maxItems);

    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
  }

  /**
   * Scroll Animations using Intersection Observer
   */
  function initScrollAnimations() {
    if (!('IntersectionObserver' in window)) return;

    const animatedElements = document.querySelectorAll('[data-animate]');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animatedElements.forEach(el => observer.observe(el));
  }

  /**
   * Quick View Modal Initialization
   */
  function initQuickView() {
    const quickViewButtons = document.querySelectorAll('[data-quick-view]');
    const modal = document.getElementById('quick-view-modal');

    if (!modal) return;

    quickViewButtons.forEach(btn => {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        const productUrl = this.dataset.quickView;

        if (productUrl) {
          openQuickView(productUrl);
        }
      });
    });

    // Close modal handlers
    const closeButtons = modal.querySelectorAll('[data-quick-view-close]');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', closeQuickView);
    });

    // Close on ESC
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeQuickView();
      }
    });
  }

  function openQuickView(url) {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Fetch product data
    fetch(url + '.json')
      .then(response => response.json())
      .then(data => {
        populateQuickView(data.product);
      })
      .catch(error => {
        console.error('Error loading product:', error);
      });
  }

  function closeQuickView() {
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function populateQuickView(product) {
    const modal = document.getElementById('quick-view-modal');
    if (!modal || !product) return;

    const loading = modal.querySelector('.quick-view-loading');
    const content = modal.querySelector('.quick-view-product');

    if (loading) loading.style.display = 'none';
    if (content) {
      content.style.display = 'grid';

      // Populate content
      const titleEl = content.querySelector('.quick-view-title');
      const imgEl = content.querySelector('.quick-view-img');
      const priceEl = content.querySelector('.quick-view-price-current');
      const linkEl = content.querySelector('.quick-view-full-link');

      if (titleEl) titleEl.textContent = product.title;
      if (imgEl && product.images?.[0]) imgEl.src = product.images[0].src;
      if (priceEl) priceEl.textContent = formatMoney(product.variants?.[0]?.price || 0);
      if (linkEl) linkEl.href = '/products/' + product.handle;
    }
  }

  /**
   * Variant Selector - Update product options
   */
  document.querySelectorAll('.variant-select').forEach(function (select) {
    select.addEventListener('change', function () {
      updateVariant();
    });
  });

  function updateVariant() {
    const options = [];
    document.querySelectorAll('.variant-select').forEach(function (select) {
      options.push(select.value);
    });

    const productSelect = document.getElementById('ProductSelect');
    if (!productSelect) return;

    const optionValues = options.join(' / ');
    for (let i = 0; i < productSelect.options.length; i++) {
      const option = productSelect.options[i];
      if (option.text.includes(optionValues) || options.length === 1) {
        productSelect.selectedIndex = i;
        break;
      }
    }
  }

})();

/* Additional CSS for notifications - injected via JS */
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .cart-notification {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: white;
      padding: 16px 24px;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      z-index: 9999;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .cart-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    
    .cart-notification-content {
      display: flex;
      align-items: center;
      gap: 12px;
      font-weight: 500;
    }
    
    .generic-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 9999;
      transform: translateX(100%);
      opacity: 0;
      transition: all 0.3s ease;
    }
    
    .generic-notification.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .generic-notification.error {
      background: #fee;
      color: #c00;
    }
    
    .generic-notification.info {
      background: #e8f4fd;
      color: #0066cc;
    }
    
    .mobile-nav-item {
      opacity: 0;
      transform: translateX(-20px);
    }
    
    .mobile-nav-item.animate-in {
      animation: slideInMenu 0.3s ease forwards;
    }
    
    @keyframes slideInMenu {
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
    
    .mobile-menu-toggle.is-active .hamburger-line:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    
    .mobile-menu-toggle.is-active .hamburger-line:nth-child(2) {
      opacity: 0;
    }
    
    .mobile-menu-toggle.is-active .hamburger-line:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }
  `;
  document.head.appendChild(style);
})();
