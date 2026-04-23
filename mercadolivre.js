const grid = document.getElementById('ml-grid');
const verMais = document.getElementById('ver-mais');

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://aetherx-backend-production.up.railway.app';
  
function formatPrice(price) {
  return price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function renderSkeletons() {
  grid.innerHTML = Array(8).fill('').map(() => `
    <div class="skeleton">
      <div class="skel-img"></div>
      <div class="skel-body">
        <div class="skel-line" style="width:90%"></div>
        <div class="skel-line" style="width:60%"></div>
      </div>
    </div>
  `).join('');
}

function renderCards(items) {
  grid.innerHTML = items.map(item => {
    const installment = item.installments
      ? `${item.installments.quantity}x de ${formatPrice(item.installments.amount)} sem juros`
      : '';
    const sold = item.sold_quantity ? `${item.sold_quantity}+ vendidos` : '';

    return `
      <a class="product-card" href="${item.permalink}" target="_blank">
        <img class="card-img"
          src="${item.thumbnail.replace('I.jpg', 'O.jpg')}"
          alt="${item.title}" loading="lazy">
        <div class="card-body">
          ${sold ? `<span class="card-badge">🔥 ${sold}</span>` : ''}
          <p class="card-name">${item.title}</p>
          <p class="card-price">${formatPrice(item.price)}</p>
          ${installment ? `<p class="card-installment">${installment}</p>` : ''}
        </div>
      </a>
    `;
  }).join('');
}

async function loadProducts(categoryId) {
  renderSkeletons();
  verMais.href = `https://www.mercadolivre.com.br/c/${categoryId}`;

  try {
    const res = await fetch(`${API_URL}/api/produtos?cat=${categoryId}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      grid.innerHTML = `<p class="error-msg">Nenhum produto encontrado.</p>`;
      return;
    }

    renderCards(data.results);
  } catch (e) {
    grid.innerHTML = `<p class="error-msg">Erro ao carregar produtos.</p>`;
  }
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    loadProducts(btn.dataset.cat);
  });
});

loadProducts('MLB1648');