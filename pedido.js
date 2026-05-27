const inputImagem = document.getElementById('imagem_referencia');
const previewBox = document.getElementById('preview-box');
const previewImg = document.getElementById('preview-img');
const previewName = document.getElementById('preview-name');

inputImagem.addEventListener('change', () => {
    const file = inputImagem.files[0];

    if (!file) {
        previewBox.classList.add('hidden');
        previewImg.src = '';
        previewName.textContent = '';
        return;
    }

    if (!file.type.startsWith('image/')) {
        alert('Selecione apenas imagem.');
        inputImagem.value = '';
        return;
    }

    const limiteBytes = LIMITE_IMAGEM_MB * 1024 * 1024;
    if (file.size > limiteBytes) {
        alert(`A imagem é muito pesada. Envie uma imagem de até ${LIMITE_IMAGEM_MB} MB.`);
        inputImagem.value = '';
        previewBox.classList.add('hidden');
        previewImg.src = '';
        previewName.textContent = '';
        return;
    }

    previewImg.src = URL.createObjectURL(file);
    previewName.textContent = file.name;
    previewBox.classList.remove('hidden');
});

function validarPedido(dados, imagem) {
    if (!dados.nomeCliente) return 'Digite o nome de quem pediu.';
    if (!dados.dataEntrega) return 'Selecione a data e hora de entrega.';
    if (!imagem) return 'Anexe a imagem de referência.';

    const partes = dados.dataEntrega.split(' ');
    if (partes.length < 2) return 'Selecione data e hora válidas.';

    const [dia, mes, ano] = partes[0].split('/');
    const [hora, minuto] = partes[1].split(':');
    const dataSelecionada = new Date(ano, mes - 1, dia, hora, minuto);

    if (dataSelecionada < new Date()) {
        return 'Você não pode selecionar uma data/hora passada.';
    }

    return null;
}

function arquivoParaBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const resultado = String(reader.result || '');
            const base64 = resultado.split(',')[1];
            resolve(base64);
        };

        reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
        reader.readAsDataURL(file);
    });
}

async function salvarNaPlanilhaEDrive(dados) {
    if (URL_PLANILHA.includes('COLE_AQUI')) {
        throw new Error('Configure a URL do Apps Script no arquivo config.js.');
    }

    const resposta = await fetch(URL_PLANILHA, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(dados)
    });

    const texto = await resposta.text();

    let resultado;

    try {
        resultado = JSON.parse(texto);
    } catch (erro) {
        throw new Error('O Apps Script não retornou uma resposta válida.');
    }

    if (!resultado.ok) {
        throw new Error(resultado.erro || 'Erro ao salvar pedido.');
    }

    return resultado;
}

async function enviarPedido() {
    const imagem = inputImagem.files[0];

    const dados = {
        dataPedido: new Date().toLocaleString('pt-BR'),
        nomeCliente: document.getElementById('nomeCliente').value.trim(),
        nomeTopper: document.getElementById('nomeTopper').value.trim(),
        idade: document.getElementById('idade').value.trim(),
        dataEntrega: document.getElementById('data_entrega').value.trim(),
        observacoes: document.getElementById('observacoes').value.trim(),
        status: 'Pendente'
    };

    const erro = validarPedido(dados, imagem);
    if (erro) {
        alert(erro);
        return;
    }

    try {
        setLoading(true);
        setStatus('Preparando imagem...', 'info');

        dados.imagemBase64 = await arquivoParaBase64(imagem);
        dados.imagemNome = imagem.name;
        dados.imagemTipo = imagem.type;

        setStatus('Salvando pedido e imagem no Drive...', 'info');

        const resultado = await salvarNaPlanilhaEDrive(dados);
        const linkImagem = resultado.linkImagem || '';

        const mensagem = `*--- NOVO PEDIDO DE TOPPER ---*\n\n` +
            `*Nome de quem pediu:* ${dados.nomeCliente}\n` +
            `*Nome no topper:* ${dados.nomeTopper || 'Não informado'}\n` +
            `*Idade:* ${dados.idade || 'Não informado'}\n` +
            `*Entrega:* ${dados.dataEntrega}\n` +
            `*Observações:* ${dados.observacoes || 'Nenhuma'}\n\n` +
            `*Imagem de referência:*\n${linkImagem || 'Imagem salva junto com o pedido.'}`;

        setStatus('Pedido enviado. Abrindo WhatsApp...', 'success');

        window.location.href = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeWhatsApp(mensagem)}`;

    } catch (error) {
        console.error(error);
        alert(error.message || 'Erro ao enviar o pedido.');
        setStatus('Erro ao enviar. Confira as configurações.', 'error');
    } finally {
        setLoading(false);
    }
}

const campoIdade = document.getElementById('idade');

if (campoIdade) {
    campoIdade.addEventListener('input', function () {
        let valor = this.value.replace(/\D/g, '');

        valor = valor.slice(0, 3);

        valor = valor.replace(/^0+/, '');

        if (Number(valor) > 125) {
            valor = '125';
        }

        this.value = valor;
    });
}

function limitarCaracteres(idCampo, limite) {
    const campo = document.getElementById(idCampo);

    if (!campo) return;

    campo.addEventListener('input', function () {
        if (this.value.length > limite) {
            this.value = this.value.slice(0, limite);
        }
    });
}

limitarCaracteres('nomeCliente', 40);
limitarCaracteres('nomeTopper', 30);