/**
 * Avalane & Co - Shopify Theme JavaScript
 */

(function() {
  'use strict';

  // DOM Ready
  document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initProductGallery();
    initQuantitySelectors();
    initAddToCart();
    initCartRemove();
  });

  /**
   * Mobile Menu Toggle
   */
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (!toggle || !mobileMenu) return;
    
    toggle.addEventListener('click', function() {
      const isOpen = mobileMenu.classList.toggle('active');
      toggle.setAttribute('aria-expanded', isOpen);
      mobileMenu.setAttribute('aria-hidden', !isOpen);
      
      // Toggle hamburger animation
      toggle.classList.toggle('is-active', isOpen);
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
      if (!toggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
      }
    });
  }

  /**
   * Product Gallery - Thumbnail Navigation
   */
  function initProductGallery() {
    const mainImage = document.getElementById('ProductMainImage');
    const thumbnails = document.querySelectorAll('.thumbnail-btn');
    
    if (!mainImage || !thumbnails.length) return;
    
    thumbnails.forEach(function(thumb) {
      thumb.addEventListener('click', function() {
        const newSrc = this.dataset.image;
        if (newSrc) {
          mainImage.src = newSrc;
          
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
    
    selectors.forEach(function(selector) {
      const input = selector.querySelector('.quantity-input');
      const minusBtn = selector.querySelector('.quantity-btn.minus, .quantity-btn[data-action="decrease"]');
      const plusBtn = selector.querySelector('.quantity-btn.plus, .quantity-btn[data-action="increase"]');
      
      if (!input) return;
      
      if (minusBtn) {
        minusBtn.addEventListener('click', function() {
          const currentValue = parseInt(input.value) || 1;
          const min = parseInt(input.min) || 0;
          if (currentValue > min) {
            input.value = currentValue - 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
      
      if (plusBtn) {
        plusBtn.addEventListener('click', function() {
          const currentValue = parseInt(input.value) || 1;
          const max = parseInt(input.max) || Infinity;
          if (currentValue < max) {
            input.value = currentValue + 1;
            input.dispatchEvent(new Event('change'));
          }
        });
      }
    });
  }

  /**
   * Add to Cart with AJAX
   */
  function initAddToCart() {
    const forms = document.querySelectorAll('.product-form, form[action="/cart/add"]');
    
    forms.forEach(function(form) {
      if (form.closest('.cart-page')) return; // Skip cart forms
      
      form.addEventListener('submit', function(e) {
        const submitBtn = form.querySelector('[type="submit"]');
        if (!submitBtn) return;
        
        // Buy Now button should go to checkout
        if (document.activeElement.classList.contains('btn-buy-now')) {
          return; // Let it submit normally
        }
        
        e.preventDefault();
        
        const formData = new FormData(form);
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Đang thêm...</span>';
        
        fetch('/cart/add.js', {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          submitBtn.innerHTML = '<span>Đã thêm ✓</span>';
          
          // Update cart count
          updateCartCount();
          
          // Reset button after 2 seconds
          setTimeout(function() {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
          }, 2000);
        })
        .catch(error => {
          console.error('Error:', error);
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
          alert('Có lỗi xảy ra. Vui lòng thử lại.');
        });
      });
    });
  }

  /**
   * Cart Item Removal
   */
  function initCartRemove() {
    const removeButtons = document.querySelectorAll('.cart-item-remove');
    
    removeButtons.forEach(function(btn) {
      btn.addEventListener('click', function() {
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
        countElements.forEach(function(el) {
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
   * Update Cart Totals
   */
  function updateCartTotal(cart) {
    const subtotalEl = document.querySelector('.cart-subtotal-price');
    if (subtotalEl && cart.total_price !== undefined) {
      subtotalEl.textContent = formatMoney(cart.total_price);
    }
  }

  /**
   * Format Money (Vietnamese Dong)
   */
  function formatMoney(cents) {
    const amount = (cents / 100).toLocaleString('vi-VN');
    return amount + '₫';
  }

  /**
   * Variant Selector - Update product options
   */
  document.querySelectorAll('.variant-select').forEach(function(select) {
    select.addEventListener('change', function() {
      updateVariant();
    });
  });

  function updateVariant() {
    // Get all selected option values
    const options = [];
    document.querySelectorAll('.variant-select').forEach(function(select) {
      options.push(select.value);
    });

    // Find matching variant from product JSON
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
