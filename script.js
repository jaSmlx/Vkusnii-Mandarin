'use strict';

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

const contactsForm = document.querySelector('.contacts-form');
const deliveryForm = document.getElementById('deliveryForm');

const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');

const track = document.querySelector('.dignity-track');
const items = document.querySelectorAll('.dignity-item');
const dotsContainer = document.querySelector('.dignity-dots');

let dishes = [];
let orderItems = [];
let total = 0;
let currentIndex = 0;
let sliderInterval = null;

fetch('/api/dishes')
    .then(res => res.json())
    .then(data => {
        dishes = data;
        renderMenu(dishes);
        renderSelect(dishes);
    })
    .catch(console.error);

function renderMenu(items) {
    const fragment = document.createDocumentFragment();

    items.forEach(dish => {
        const card = document.createElement('div');
        card.className = 'menu-item';
        card.dataset.category = dish.category;

        card.innerHTML = `
            <img 
                src="img/menu/${dish.image || 'shablon.png'}"
                alt="${dish.name}"
                loading="lazy"
            >
            <p class="dish-text">${dish.name}</p>
            <p class="dish-price">${dish.price} ₽</p>

            <div class="menu-overlay">
                <p class="overlay-title">${dish.name}</p>
                <p class="overlay-desc">${dish.description}</p>
                <p class="overlay-info"><b>Вес:</b> ${dish.weight} г</p>
                <p class="overlay-info"><b>КБЖУ:</b> ${dish.calories} / ${dish.proteins} / ${dish.fats} / ${dish.carbs}</p>
                <p class="overlay-info"><b>Состав:</b> ${dish.ingredient || '—'}</p>
            </div>
        `;

        fragment.appendChild(card);
    });

    menuGrid.innerHTML = '';
    menuGrid.appendChild(fragment);
}

menuGrid.addEventListener('click', e => {
    const card = e.target.closest('.menu-item');
    if (!card) return;

    menuGrid.querySelectorAll('.menu-item.active')
        .forEach(c => c !== card && c.classList.remove('active'));

    card.classList.toggle('active');
});

filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display =
                filter === 'all' || item.dataset.category === filter
                    ? 'block'
                    : 'none';
        });
    });
});

function renderSelect(items) {
    const fragment = document.createDocumentFragment();

    items.forEach(dish => {
        const option = document.createElement('div');
        option.className = 'select-item';
        option.innerHTML = `<span>${dish.name}</span><span>${dish.price} ₽</span>`;

        option.addEventListener('click', () => {
            addItem(dish.name, dish.price);
            select.classList.remove('open');
        });

        fragment.appendChild(option);
    });

    selectBody.innerHTML = '';
    selectBody.appendChild(fragment);
}

head.addEventListener('click', () => {
    select.classList.toggle('open');
});

function addItem(name, price) {
    orderBlock.hidden = false;
    orderItems.push({ name, price });
    total += price;
    updateTotal();

    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML = `
        <span>${name}</span>
        <span>${price} ₽</span>
        <button type="button" class="remove-btn">✕</button>
    `;

    row.querySelector('.remove-btn').addEventListener('click', () => {
        total -= price;
        orderItems = orderItems.filter(i => i.name !== name);
        row.remove();
        updateTotal();
        if (!orderList.children.length) orderBlock.hidden = true;
    });

    orderList.appendChild(row);
}

function updateTotal() {
    totalPriceEl.textContent = `${total} ₽`;
}

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

burgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
});

document.addEventListener('click', e => {
    if (
        mobileMenu.classList.contains('active') &&
        !mobileMenu.contains(e.target) &&
        !burgerBtn.contains(e.target)
    ) {
        mobileMenu.classList.remove('active');
    }
});

items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dignity-dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});

const dots = document.querySelectorAll('.dignity-dot');

function goToSlide(index) {
    currentIndex = index;
    track.style.transform = `translateX(-${index * 120}%)`;
    dots.forEach(d => d.classList.remove('active'));
    dots[index].classList.add('active');
}

function startSlider() {
    return setInterval(() => {
        currentIndex = (currentIndex + 1) % items.length;
        goToSlide(currentIndex);
    }, 4000);
}

function checkSlider() {
    if (window.innerWidth <= 768 && !sliderInterval) {
        sliderInterval = startSlider();
    } else if (window.innerWidth > 768 && sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

checkSlider();
window.addEventListener('resize', checkSlider);

const isValidEmail = email =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidPhone = phone =>
    /^\+?\d{10,15}$/.test(phone.replace(/\D/g, ''));

function showError(input, message) {
    input.classList.add('input-error');
    alert(message);
    input.focus();
}

function clearErrors(form) {
    form.querySelectorAll('.input-error')
        .forEach(el => el.classList.remove('input-error'));
}

contactsForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(contactsForm);

    const name = document.getElementById('fio-contacts');
    const email = document.getElementById('email-contacts');
    const message = contactsForm.querySelector('textarea');

    if (name.value.trim().length < 2) return showError(name, 'Введите имя');
    if (!isValidEmail(email.value)) return showError(email, 'Некорректный email');
    if (message.value && message.value.length < 10)
        return showError(message, 'Минимум 10 символов');

    emailjs.send('service_jl9ot7e', 'template_gqxwq5k', {
        name: name.value,
        email: email.value,
        message: message.value
    }).then(() => {
        alert('Сообщение отправлено');
        contactsForm.reset();
    });
});

deliveryForm.addEventListener('submit', e => {
    e.preventDefault();
    clearErrors(deliveryForm);

    const phone = document.getElementById('phone');
    const fio = document.getElementById('fio');
    const email = document.getElementById('email');
    const address = document.getElementById('address');
    const isDelivery = deliveryBtn.classList.contains('active');

    if (!orderItems.length) return alert('Добавьте блюда');
    if (!isValidPhone(phone.value)) return showError(phone, 'Телефон неверный');
    if (fio.value.trim().split(' ').length < 2) return showError(fio, 'Введите ФИО');
    if (!isValidEmail(email.value)) return showError(email, 'Email неверный');
    if (isDelivery && address.value.trim().length < 5)
        return showError(address, 'Введите адрес');

    fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: fio.value,
            phone: phone.value,
            email: email.value,
            deliveryType: isDelivery ? 'delivery' : 'pickup',
            address: isDelivery ? address.value : null,
            items: orderItems,
            total
        })
    }).then(res => {
        if (res.ok) {
            alert('Заказ оформлен');
            deliveryForm.reset();
            orderList.innerHTML = '';
            orderBlock.hidden = true;
            orderItems = [];
            total = 0;
            updateTotal();
        } else {
            alert('Ошибка при оформлении заказа');
        }
    }).catch(err => {
        console.error(err);
        alert('Ошибка сервера');
    });
});