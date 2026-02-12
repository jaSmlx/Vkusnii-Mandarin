const menuGrid = document.querySelector('.menu-grid');
const filterButtons = document.querySelectorAll('.menu-filter');

const select = document.getElementById('customSelect');
const head = select.querySelector('.select-head');
const selectBody = select.querySelector('.select-body');

const orderBlock = document.getElementById('orderBlock');
const orderList = document.getElementById('orderList');
const totalPriceEl = document.getElementById('totalPrice');

const deliveryBtn = document.querySelector('.btn-delivery');
const pickupBtn = document.querySelector('.btn-with-you');
const deliveryFields = document.querySelector('.delivery-active');
const addressInput = document.getElementById('address');

let dishes = [];
let total = 0;

fetch('http://localhost:3000/api/dishes')
    .then(res => res.json())
    .then(dishes => {
        renderMenu(dishes);
        initMenuOverlay();
        renderSelect(dishes);
    })
    .catch(err => {
        console.error('Ошибка загрузки меню:', err);
    });

function renderMenu(dishes) {
    menuGrid.innerHTML = '';

    dishes.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.dataset.category = dish.category;

        card.innerHTML = `
            <img src="img/menu/${dish.image || 'shablon.png'}" alt="${dish.name}">

            <p class="dish-text">${dish.name}</p>
            <p class="dish-price">${dish.price} ₽</p>

            <div class="menu-overlay">
                <p class="overlay-title">${dish.name}</p>

                <p class="overlay-desc">
                    ${dish.description}
                </p>

                <p class="overlay-info"><b>Вес:</b> ${dish.weight} г</p>
                <p class="overlay-info">
                    <b>КБЖУ:</b>
                    ${dish.calories} /
                    ${dish.proteins} /
                    ${dish.fats} /
                    ${dish.carbs}
                </p>
                <p class="overlay-info">
                    <b>Состав:</b> ${dish.ingredients}
                </p>
            </div>
        `;

        menuGrid.appendChild(card);
    });
}

function initMenuOverlay() {
    const cards = document.querySelectorAll('.menu-item');

    cards.forEach(card => {
        card.addEventListener('click', () => {

            cards.forEach(c => {
                if (c !== card) c.classList.remove('active');
            });

            card.classList.toggle('active');
        });
    });
}

function renderSelect(items) {
    selectBody.innerHTML = '';

    items.forEach(dish => {
        const option = document.createElement('div');
        option.className = 'select-item';
        option.dataset.name = dish.name;
        option.dataset.price = dish.price;

        option.innerHTML = `
            ${dish.name}
            <span>${dish.price} ₽</span>
        `;

        option.addEventListener('click', () => {
            addItem(dish.name, dish.price);
            select.classList.remove('open');
        });

        selectBody.appendChild(option);
    });
}

head.addEventListener('click', () => {
    select.classList.toggle('open');
});

function addItem(name, price) {
    orderBlock.hidden = false;

    const row = document.createElement('div');
    row.className = 'order-row';

    row.innerHTML = `
        <span>${name}</span>
        <span>${price} ₽</span>
        <button type="button" class="remove-btn">✕</button>
    `;

    row.querySelector('.remove-btn').addEventListener('click', () => {
        total -= price;
        row.remove();
        updateTotal();

        if (!orderList.children.length) {
            orderBlock.hidden = true;
        }
    });

    orderList.appendChild(row);
    total += price;
    updateTotal();
}

function updateTotal() {
    totalPriceEl.textContent = `${total} ₽`;
}

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.dataset.filter;

        document.querySelectorAll('.menu-item').forEach(item => {
            if (filter === 'all' || item.dataset.category === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    });
});

deliveryBtn.addEventListener('click', () => {
    deliveryBtn.classList.add('active');
    pickupBtn.classList.remove('active');

    deliveryFields.style.display = 'grid';
    addressInput.required = true;
});

pickupBtn.addEventListener('click', () => {
    pickupBtn.classList.add('active');
    deliveryBtn.classList.remove('active');

    deliveryFields.style.display = 'none';
    addressInput.required = false;
});

const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
    });
});

document.addEventListener('click', (event) => {
    const isMenuOpen = mobileMenu.classList.contains('active');

    if (!isMenuOpen) return;

    const clickInsideMenu = mobileMenu.contains(event.target);
    const clickOnBurger = burgerBtn.contains(event.target);

    if (!clickInsideMenu && !clickOnBurger) {
        mobileMenu.classList.remove('active');
    }
});

const track = document.querySelector('.dignity-track');
const items = document.querySelectorAll('.dignity-item');
const dotsContainer = document.querySelector('.dignity-dots');

let currentIndex = 0;

items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.classList.add('dignity-dot');
    if (i === 0) dot.classList.add('active');

    dot.addEventListener('click', () => {
        goToSlide(i);
    });

    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dignity-dot');

function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${index * 120}%)`;

    dots.forEach(dot => dot.classList.remove('active'));
    dots[index].classList.add('active');
}

//валидация
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^\+?\d{10,15}$/.test(phone.replace(/\s|\(|\)|-/g, ''));
}

function showError(input, message) {
    input.classList.add('input-error');
    alert(message);
    input.focus();
}

function clearErrors(form) {
    form.querySelectorAll('.input-error').forEach(el => {
        el.classList.remove('input-error');
    });
}

const deliveryForm = document.getElementById('deliveryForm');

deliveryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(deliveryForm);

    const phone = document.getElementById('phone');
    const fio = document.getElementById('fio');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const isDelivery = deliveryBtn.classList.contains('active');

    if (!orderList.children.length) {
        alert('Добавьте хотя бы одно блюдо в заказ');
        return;
    }

    if (!isValidPhone(phone.value)) {
        showError(phone, 'Введите корректный номер телефона');
        return;
    }

    if (fio.value.trim().split(' ').length < 2) {
        showError(fio, 'Введите ФИО полностью');
        return;
    }

    if (!isValidEmail(email.value)) {
        showError(email, 'Введите корректный email');
        return;
    }

    if (isDelivery && address.value.trim().length < 5) {
        showError(address, 'Введите адрес доставки');
        return;
    }

    alert('Заказ успешно оформлен');
    deliveryForm.reset();
    orderList.innerHTML = '';
    orderBlock.hidden = true;
    total = 0;
    updateTotal();
});

const contactsForm = document.querySelector('.contacts-form');

contactsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(contactsForm);

    const name = document.getElementById('fio-contacts');
    const email = document.getElementById('email-contacts');
    const message = contactsForm.querySelector('textarea');

    if (name.value.trim().length < 2) {
        showError(name, 'Введите ваше имя');
        return;
    }

    if (!isValidEmail(email.value)) {
        showError(email, 'Введите корректный email');
        return;
    }

    if (message.value && message.value.trim().length < 10) {
        showError(message, 'Сообщение должно быть не короче 10 символов');
        return;
    }

    alert('Сообщение отправлено ');
    contactsForm.reset();
});