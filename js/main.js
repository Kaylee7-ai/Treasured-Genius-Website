/* ============================================
   Treasured Genius — Main JavaScript
   Cart, Navigation, Interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initCart();
  initSmoothScroll();
});

/* ---------- Sticky Header ---------- */
function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 20) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load
}

/* ---------- Mobile Menu ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('mobileToggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('active', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ---------- Cart (localStorage) ---------- */
const CART_KEY = 'tg_cart';

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const cart = getCart();
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;

  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  countEl.textContent = totalItems;

  if (totalItems > 0) {
    countEl.classList.add('has-items');
  } else {
    countEl.classList.remove('has-items');
  }
}

function initCart() {
  updateCartUI();
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || '',
      quantity: 1,
      customizations: product.customizations || {}
    });
  }

  saveCart(cart);
  showToast(\`\${product.name} added to cart\`);
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== productId);
  saveCart(cart);
}

function updateQuantity(productId, quantity) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  if (quantity <= 0) {
    removeFromCart(productId);
  } else {
    item.quantity = quantity;
    saveCart(cart);
  }
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateCartUI();
}

function getCartTotal() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
}

/* Make cart functions available globally for other pages */
window.TGCart = {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal,
  updateCartUI
};

/* ---------- Toast Notification ---------- */
function showToast(message, duration = 2800) {
  // Remove existing toast
  const existing = document.querySelector('.tg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'tg-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/* ---------- Smooth Scroll for anchor links ---------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ---------- Extra CSS injected for mobile menu + toast ---------- */
(function injectExtraStyles() {
  const style = document.createElement('style');
  style.textContent = \`
    /* Mobile nav open state */
    @media (max-width: 768px) {
      .nav-links {
        position: fixed;
        top: 72px;
        left: 0;
        right: 0;
        background: rgba(248, 241, 227, 0.98);
        backdrop-filter: blur(16px);
        flex-direction: column;
        padding: 2rem 1.5rem;
        gap: 1.5rem;
        border-bottom: 1px solid rgba(201, 162, 39, 0.2);
        transform: translateY(-120%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        z-index: 99;
      }

      .nav-links.open {
        display: flex;
        transform: translateY(0);
        opacity: 1;
        visibility: visible;
      }

      .nav-links a {
        font-size: 1.15rem;
        padding: 0.5rem 0;
      }

      .mobile-toggle.active span:nth-child(1) {
        transform: translateY(7px) rotate(45deg);
      }
      .mobile-toggle.active span:nth-child(2) {
        opacity: 0;
      }
      .mobile-toggle.active span:nth-child(3) {
        transform: translateY(-7px) rotate(-45deg);
      }
    }

    /* Toast */
    .tg-toast {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: var(--espresso, #4A3428);
      color: white;
      padding: 0.9rem 1.6rem;
      border-radius: 9999px;
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
      z-index: 9999;
      white-space: nowrap;
    }

    .tg-toast.show {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }
  \`;
  document.head.appendChild(style);
})();