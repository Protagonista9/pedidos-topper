
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

function limitarIdade(input) {
    let valor = input.value;

    let numeros = valor.match(/\d+/g);

    if (numeros) {
        let numero = numeros.join('').slice(0, 3);

        // remove zero inicial
        numero = numero.replace(/^0+/, '');

        // limita até 125
        if (numero && Number(numero) > 125) {
            numero = '125';
        }

        valor = valor.replace(/\d+/g, '');
        input.value = (numero + valor).slice(0, 15);
    } else {
        input.value = valor.slice(0, 15);
    }
}
