// scripts/app.js

// Конфигурация приложения
const CONFIG = {
    currency: '₽',
    deliveryThreshold: 0,
    freeDeliveryText: 'Бесплатная доставка!',
    cartStorageKey: 'xiaomiTechCart'
};

// Данные о товарах
const PRODUCTS = {
    1: { id: 1, name: 'Xiaomi 14 Pro', price: 0, category: 'xiaomi' },
    2: { id: 2, name: 'Xiaomi 13T', price: 0, category: 'xiaomi' },
    3: { id: 3, name: 'Redmi Note 13 Pro', price: 0, category: 'redmi' },
    4: { id: 4, name: 'Redmi 12', price: 0, category: 'redmi' },
    5: { id: 5, name: 'Xiaomi Civi 3', price: 0, category: 'xiaomi' },
    6: { id: 6, name: 'Xiaomi Mix Fold 3', price: 0, category: 'xiaomi' },
    7: { id: 7, name: 'POCO X6 Pro', price: 0, category: 'poco' },
    8: { id: 8, name: 'POCO F5', price: 0, category: 'poco' },
    9: { id: 9, name: 'Redmi K70', price: 0, category: 'redmi' },
    10: { id: 10, name: 'Xiaomi 13 Ultra', price: 0, category: 'xiaomi' },
    11: { id: 11, name: 'POCO M6 Pro', price: 0, category: 'poco' },
    12: { id: 12, name: 'Redmi Note 12', price: 0, category: 'redmi' }
};

// Юмор для уведомлений
const JOKES = [
    "Отличный выбор! Этот смартфон такой мощный, что даже умеет смеяться! 😄",
    "Добавлено в корзину! Батарея на 0 mAh — значит никогда не разрядится! 🔋",
    "Ваш заказ стал веселее! Камера на 0 МП — идеально для сюрреалистичных фото! 📸",
    "Смартфон добавлен! Процессор Mediatek MT6580 уже готов шутить! 🚀",
    "Ещё один бесплатный смартфон в корзине! Наши цены — лучшая шутка дня! 😂",
    "Отлично! Этот телефон такой лёгкий, что его батарея весит 0 mAh! ✨",
    "Добавлено! Помните: хорошее настроение входит в комплект! 😊",
    "Смартфон в корзине! У него 0 недостатков... кроме всех характеристик! 🤣"
];

// Состояние корзины
let cart = {
    items: {},
    total: 0,
    count: 0
};

// DOM элементы
let cartBtn, cartSidebar, cartClose, cartOverlay, cartItems, cartEmpty, cartTotal, cartCount, checkoutBtn, toastContainer;
let addToCartButtons = [];

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    loadCartFromStorage();
    setupEventListeners();
    updateCartDisplay();
    setupFilters();
    setupThemeToggle();
    setupMobileMenu();
});

// Инициализация DOM элементов
function initializeElements() {
    cartBtn = document.getElementById('cartBtn');
    cartSidebar = document.getElementById('cartSidebar');
    cartClose = document.getElementById('cartClose');
    cartOverlay = document.getElementById('cartOverlay');
    cartItems = document.getElementById('cartItems');
    cartEmpty = document.getElementById('cartEmpty');
    cartTotal = document.getElementById('cartTotal');
    cartCount = document.querySelector('.cart-count');
    checkoutBtn = document.getElementById('checkoutBtn');
    toastContainer = document.getElementById('toastContainer');
    
    addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
    
    console.log('Инициализированы элементы:', {
        cartBtn: !!cartBtn,
        cartSidebar: !!cartSidebar,
        addToCartButtons: addToCartButtons.length
    });
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопка открытия корзины
    if (cartBtn) {
        cartBtn.addEventListener('click', toggleCart);
        console.log('Кнопка корзины настроена');
    }
    
    // Кнопка закрытия корзины
    if (cartClose) {
        cartClose.addEventListener('click', closeCart);
    }
    
    // Клик по оверлею
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCart);
    }
    
    // Кнопки "Добавить в корзину"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const productId = parseInt(this.getAttribute('data-id'));
            addToCart(productId);
            showToast(getRandomJoke());
        });
    });
    
    // Кнопка оформления заказа
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
    
    // Закрытие корзины по Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
            closeCart();
        }
    });
}

// Работа с корзиной
function addToCart(productId) {
    if (!PRODUCTS[productId]) {
        console.error('Товар не найден:', productId);
        return;
    }
    
    const product = PRODUCTS[productId];
    
    if (cart.items[productId]) {
        cart.items[productId].quantity += 1;
    } else {
        cart.items[productId] = {
            product: product,
            quantity: 1
        };
    }
    
    updateCartTotals();
    saveCartToStorage();
    updateCartDisplay();
    
    console.log('Добавлен товар:', product.name, 'Корзина:', cart);
}

function removeFromCart(productId) {
    if (cart.items[productId]) {
        delete cart.items[productId];
        updateCartTotals();
        saveCartToStorage();
        updateCartDisplay();
    }
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    if (cart.items[productId]) {
        cart.items[productId].quantity = newQuantity;
        updateCartTotals();
        saveCartToStorage();
        updateCartDisplay();
    }
}

function updateCartTotals() {
    cart.total = 0;
    cart.count = 0;
    
    Object.values(cart.items).forEach(item => {
        cart.total += item.product.price * item.quantity;
        cart.count += item.quantity;
    });
}

// Отображение корзины
function updateCartDisplay() {
    // Обновляем счетчик в кнопке корзины
    if (cartCount) {
        cartCount.textContent = cart.count;
        cartCount.style.display = cart.count > 0 ? 'flex' : 'none';
    }
    
    // Обновляем общую сумму
    if (cartTotal) {
        cartTotal.textContent = `${cart.total} ${CONFIG.currency}`;
    }
    
    // Обновляем список товаров в корзине
    if (cartItems && cartEmpty) {
        if (Object.keys(cart.items).length === 0) {
            cartItems.innerHTML = '';
            cartEmpty.style.display = 'block';
        } else {
            cartEmpty.style.display = 'none';
            renderCartItems();
        }
    }
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    Object.values(cart.items).forEach(item => {
        const cartItem = createCartItemElement(item);
        cartItems.appendChild(cartItem);
    });
}

function createCartItemElement(item) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
        <div class="cart-item-info">
            <h4>${item.product.name}</h4>
            <p>${item.product.price} ${CONFIG.currency} × ${item.quantity} шт.</p>
        </div>
        <div class="cart-item-actions">
            <div class="quantity-control">
                <button class="quantity-btn minus" data-id="${item.product.id}">−</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-id="${item.product.id}">+</button>
            </div>
            <button class="remove-btn" data-id="${item.product.id}" title="Удалить">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Добавляем обработчики для кнопок
    const minusBtn = div.querySelector('.minus');
    const plusBtn = div.querySelector('.plus');
    const removeBtn = div.querySelector('.remove-btn');
    
    minusBtn.addEventListener('click', () => {
        updateQuantity(item.product.id, item.quantity - 1);
    });
    
    plusBtn.addEventListener('click', () => {
        updateQuantity(item.product.id, item.quantity + 1);
    });
    
    removeBtn.addEventListener('click', () => {
        removeFromCart(item.product.id);
    });
    
    return div;
}

// Управление корзиной (открытие/закрытие)
function toggleCart() {
    console.log('Toggle cart called');
    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

function openCart() {
    cartSidebar.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Оформление заказа
function checkout() {
    if (cart.count === 0) {
        showToast('Добавьте товары в корзину перед оформлением заказа!', 'warning');
        return;
    }
    
    const joke = getRandomJoke();
    showToast(`Заказ оформлен! Спасибо за покупку! ${joke}`, 'success');
    
    // Очищаем корзину после оформления
    cart = { items: {}, total: 0, count: 0 };
    saveCartToStorage();
    updateCartDisplay();
    closeCart();
}

// Фильтрация товаров
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Убираем активный класс у всех кнопок
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Добавляем активный класс текущей кнопке
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            productCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Переключение темы
function setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle?.querySelector('i');
    
    if (!themeToggle) return;
    
    // Проверяем сохраненную тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme, themeIcon);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme, themeIcon);
    });
}

function updateThemeIcon(theme, icon) {
    if (!icon) return;
    
    if (theme === 'dark') {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
}

// Мобильное меню
function setupMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (!menuToggle || !navMenu) return;
    
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
    });
    
    // Закрытие меню при клике на ссылку
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            menuToggle.classList.remove('active');
        });
    });
}

// Уведомления (toast)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${getToastIcon(type)}"></i>
            <p>${message}</p>
        </div>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Анимация появления
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Закрытие по кнопке
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => closeToast(toast));
    
    // Автоматическое закрытие
    setTimeout(() => closeToast(toast), 5000);
}

function closeToast(toast) {
    toast.classList.remove('show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function getToastIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'warning': return 'exclamation-triangle';
        case 'error': return 'times-circle';
        default: return 'info-circle';
    }
}

// Вспомогательные функции
function getRandomJoke() {
    return JOKES[Math.floor(Math.random() * JOKES.length)];
}

// Локальное хранилище
function saveCartToStorage() {
    try {
        localStorage.setItem(CONFIG.cartStorageKey, JSON.stringify(cart));
    } catch (e) {
        console.error('Ошибка сохранения корзины:', e);
    }
}

function loadCartFromStorage() {
    try {
        const savedCart = localStorage.getItem(CONFIG.cartStorageKey);
        if (savedCart) {
            const parsed = JSON.parse(savedCart);
            
            // Восстанавливаем объекты товаров
            Object.keys(parsed.items || {}).forEach(id => {
                if (PRODUCTS[id]) {
                    parsed.items[id].product = PRODUCTS[id];
                }
            });
            
            cart = parsed;
            updateCartTotals();
        }
    } catch (e) {
        console.error('Ошибка загрузки корзины:', e);
    }
}

// Добавляем стили для уведомлений и корзины
const injectStyles = () => {
    const styles = `
        /* Стили для корзины */
        .cart-sidebar {
            position: fixed;
            top: 0;
            right: -400px;
            width: 380px;
            height: 100vh;
            background: var(--light-color);
            box-shadow: var(--shadow-lg);
            z-index: 1100;
            transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            flex-direction: column;
        }
        
        .cart-sidebar.active {
            right: 0;
        }
        
        .cart-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 1099;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        
        .cart-overlay.active {
            opacity: 1;
            visibility: visible;
        }
        
        .cart-header {
            padding: 25px;
            border-bottom: 1px solid var(--medium-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--gradient-primary);
            color: white;
        }
        
        .cart-header h3 {
            margin: 0;
            font-size: 1.5rem;
        }
        
        .cart-close {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        
        .cart-close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
        
        .cart-body {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
        }
        
        .cart-empty {
            text-align: center;
            padding: 60px 20px;
            color: var(--text-light);
        }
        
        .cart-empty i {
            font-size: 3rem;
            color: var(--medium-gray);
            margin-bottom: 20px;
        }
        
        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            border-bottom: 1px solid var(--medium-gray);
            animation: slideIn 0.3s ease;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateX(20px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .cart-item-info h4 {
            margin: 0 0 5px 0;
            font-size: 1.1rem;
        }
        
        .cart-item-info p {
            margin: 0;
            font-size: 0.9rem;
            color: var(--text-light);
        }
        
        .cart-item-actions {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .quantity-control {
            display: flex;
            align-items: center;
            background: var(--light-gray);
            border-radius: 20px;
            padding: 5px;
        }
        
        .quantity-btn {
            background: none;
            border: none;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            color: var(--text-color);
            transition: all 0.2s;
        }
        
        .quantity-btn:hover {
            background: var(--medium-gray);
        }
        
        .quantity {
            min-width: 30px;
            text-align: center;
            font-weight: 600;
        }
        
        .remove-btn {
            background: none;
            border: none;
            color: var(--error-color);
            cursor: pointer;
            padding: 8px;
            border-radius: 50%;
            transition: background-color 0.2s;
        }
        
        .remove-btn:hover {
            background-color: rgba(220, 53, 69, 0.1);
        }
        
        .cart-footer {
            padding: 25px;
            border-top: 1px solid var(--medium-gray);
            background: var(--light-gray);
        }
        
        .cart-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            font-size: 1.3rem;
            font-weight: 700;
        }
        
        .btn-checkout {
            width: 100%;
            padding: 15px;
            font-size: 1.1rem;
        }
        
        .cart-note {
            margin-top: 15px;
            font-size: 0.9rem;
            color: var(--text-light);
            text-align: center;
        }
        
        /* Уведомления */
        .toast-container {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1200;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 400px;
        }
        
        .toast {
            background: var(--light-color);
            border-radius: var(--radius-md);
            padding: 16px 20px;
            box-shadow: var(--shadow-lg);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            transform: translateX(100%);
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            border-left: 4px solid var(--primary-color);
        }
        
        .toast.show {
            transform: translateX(0);
            opacity: 1;
        }
        
        .toast-success {
            border-left-color: var(--success-color);
        }
        
        .toast-warning {
            border-left-color: var(--warning-color);
        }
        
        .toast-error {
            border-left-color: var(--error-color);
        }
        
        .toast-content {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
        }
        
        .toast-content i {
            font-size: 1.3rem;
        }
        
        .toast-success .toast-content i {
            color: var(--success-color);
        }
        
        .toast-warning .toast-content i {
            color: var(--warning-color);
        }
        
        .toast-error .toast-content i {
            color: var(--error-color);
        }
        
        .toast-content p {
            margin: 0;
            font-size: 0.95rem;
            line-height: 1.4;
        }
        
        .toast-close {
            background: none;
            border: none;
            color: var(--text-light);
            cursor: pointer;
            padding: 5px;
            border-radius: 50%;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
        }
        
        .toast-close:hover {
            background-color: var(--light-gray);
        }
        
        /* Адаптивность для мобильных */
        @media (max-width: 576px) {
            .cart-sidebar {
                width: 100%;
                right: -100%;
            }
            
            .cart-sidebar.active {
                right: 0;
            }
            
            .toast-container {
                left: 20px;
                right: 20px;
                max-width: none;
            }
            
            .toast {
                width: 100%;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
};

// Вставляем стили после загрузки DOM
document.addEventListener('DOMContentLoaded', injectStyles);
