function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('active-icon').innerText = newTheme === 'light' ? '☀' : '☾';
}

function setStatus(texto, tipo = '') {
    const status = document.getElementById('status-envio');
    status.textContent = texto;
    status.className = `status-envio ${tipo}`;
}

function setLoading(loading) {
    const btn = document.getElementById('btn-enviar');
    btn.disabled = loading;
    btn.textContent = loading ? 'Enviando pedido...' : 'Enviar pedido pelo WhatsApp';
}

function encodeWhatsApp(texto) {
    return encodeURIComponent(texto);
}
