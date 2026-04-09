// Inicializar data atual no fuso horário local
const inputData = document.getElementById('dataSelecao');
const agora = new Date();
const ano = agora.getFullYear();
const mes = String(agora.getMonth() + 1).padStart(2, '0');
const dia = String(agora.getDate()).padStart(2, '0');
inputData.value = `${ano}-${mes}-${dia}`;

// Função auxiliar para formatar data de yyyy-mm-dd para dd/mm/yyyy
function formatarData(dataISO) {
    if (!dataISO) return '';
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
}

// Carregar histórico de nomes para o datalist (independente do dia)
function atualizarDatalist() {
    // Usar um histórico dedicado para os nomes, ou extrair de todos os registros
    const registros = JSON.parse(localStorage.getItem('compras_app') || '[]');
    const historicoManual = JSON.parse(localStorage.getItem('compras_historico_nomes') || '[]');
    
    // Unificar todos os nomes que já apareceram nos registros + histórico manual
    const todosOsNomes = [
        ...registros.map(item => item.nome),
        ...historicoManual
    ];
    
    const nomesUnicos = [...new Set(todosOsNomes.filter(nome => nome))];
    const datalist = document.getElementById('historicoNomes');
    datalist.innerHTML = '';
    
    nomesUnicos.forEach(nome => {
        let option = document.createElement('option');
        option.value = nome;
        datalist.appendChild(option);
    });
}

function togglePersonalizado() {
    const select = document.getElementById('repeticoes');
    const inputQtd = document.getElementById('qtdPersonalizada');
    if (select.value === 'personalizado') {
        inputQtd.style.display = 'block';
    } else {
        inputQtd.style.display = 'none';
    }
}

function salvarEntrada() {
    const nome = document.getElementById('nomePessoa').value.trim();
    const selectQtd = document.getElementById('repeticoes').value;
    const data = document.getElementById('dataSelecao').value;
    
    let qtd;
    if (selectQtd === 'personalizado') {
        qtd = parseInt(document.getElementById('qtdPersonalizada').value);
        if (isNaN(qtd) || qtd <= 0) {
            alert("Por favor, insira uma quantidade válida.");
            return;
        }
    } else {
        qtd = parseInt(selectQtd);
    }

    if (!nome) {
        alert("Por favor, digite um nome.");
        return;
    }

    const dadosAtuais = JSON.parse(localStorage.getItem('compras_app') || '[]');
    
    // Adiciona o registro (usamos timestamp como ID único para exclusão facilitada)
    dadosAtuais.push({ id: Date.now(), data, nome, qtd });
    localStorage.setItem('compras_app', JSON.stringify(dadosAtuais));

    // Salvar no histórico persistente de nomes também
    const historicoNomes = JSON.parse(localStorage.getItem('compras_historico_nomes') || '[]');
    if (!historicoNomes.includes(nome)) {
        historicoNomes.push(nome);
        localStorage.setItem('compras_historico_nomes', JSON.stringify(historicoNomes));
    }

    // Limpar campo e avisar
    document.getElementById('nomePessoa').value = '';
    if (selectQtd === 'personalizado') document.getElementById('qtdPersonalizada').value = '';
    
    // Mostrar modal de sucesso rápido
    const modalSucesso = document.getElementById('modalSucesso');
    document.getElementById('mensagemSucesso').innerText = `${nome} salvo com sucesso!`;
    modalSucesso.style.display = 'block';
    
    setTimeout(() => {
        modalSucesso.style.display = 'none';
    }, 2000);
    
    atualizarDatalist();
}

function mostrarLista() {
    const data = document.getElementById('dataSelecao').value;
    const dados = JSON.parse(localStorage.getItem('compras_app') || '[]');
    const filtrados = dados.filter(item => item.data === data);
    
    const listaUl = document.getElementById('listaNomes');
    const titulo = document.getElementById('tituloListaDia');
    
    titulo.innerText = `Lista de ${formatarData(data)}`;
    listaUl.innerHTML = '';
    
    if (filtrados.length === 0) {
        listaUl.innerHTML = '<li id="emptyMsg">Nenhum nome cadastrado para este dia.</li>';
    } else {
        filtrados.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${item.nome} (${item.qtd} repetições)</span>
                <i class="fas fa-trash delete-btn" onclick="excluirItem(${item.id})"></i>
            `;
            listaUl.appendChild(li);
        });
    }
    
    document.getElementById('menuPrincipal').style.display = 'none';
    document.getElementById('telaLista').style.display = 'block';
}

let idParaExcluir = null;

function excluirItem(id) {
    idParaExcluir = id;
    document.getElementById('modalExcluirItem').style.display = 'block';
    
    // Configura o clique do botão de confirmação uma única vez
    const btnConfirmar = document.getElementById('btnConfirmarExclusao');
    btnConfirmar.onclick = function() {
        if (idParaExcluir !== null) {
            let dados = JSON.parse(localStorage.getItem('compras_app') || '[]');
            dados = dados.filter(item => item.id !== idParaExcluir);
            localStorage.setItem('compras_app', JSON.stringify(dados));
            fecharModalExcluirItem();
            mostrarLista();
        }
    };
}

function fecharModalExcluirItem() {
    document.getElementById('modalExcluirItem').style.display = 'none';
    idParaExcluir = null;
}

function confirmarReset() {
    const data = document.getElementById('dataSelecao').value;
    const dados = JSON.parse(localStorage.getItem('compras_app') || '[]');
    const filtrados = dados.filter(item => item.data === data);
    
    if (filtrados.length === 0) {
        alert("A lista já está vazia.");
        return;
    }
    
    document.getElementById('modalReset').style.display = 'block';
}

function fecharModalReset() {
    document.getElementById('modalReset').style.display = 'none';
}

function resetarLista() {
    const data = document.getElementById('dataSelecao').value;
    let dados = JSON.parse(localStorage.getItem('compras_app') || '[]');
    
    // Remove todos os itens da data selecionada
    dados = dados.filter(item => item.data !== data);
    localStorage.setItem('compras_app', JSON.stringify(dados));
    
    fecharModalReset();
    mostrarLista(); // Atualiza a tela para mostrar que está vazia
}

function voltarMenu() {
    document.getElementById('telaLista').style.display = 'none';
    document.getElementById('menuPrincipal').style.display = 'block';
}

// Fechar modais ao clicar fora deles
window.onclick = function(event) {
    const modalReset = document.getElementById('modalReset');
    const modalExcluir = document.getElementById('modalExcluirItem');
    if (event.target == modalReset) {
        fecharModalReset();
    }
    if (event.target == modalExcluir) {
        fecharModalExcluirItem();
    }
};

async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const dataBusca = document.getElementById('dataSelecao').value;
    const dados = JSON.parse(localStorage.getItem('compras_app') || '[]');

    // Filtrar dados pela data selecionada
    const filtrados = dados.filter(item => item.data === dataBusca);

    if (filtrados.length === 0) {
        alert("Nenhum dado encontrado para esta data.");
        return;
    }

    doc.setFontSize(16);
    doc.text(`Lista de Sorteio - Tufão Slots - ${formatarData(dataBusca)}`, 10, 10);
    doc.setFontSize(12);

    let linhaAtual = 20;
    let contadorTotal = 1;

    filtrados.forEach(item => {
        for (let i = 0; i < item.qtd; i++) {
            doc.text(`${contadorTotal}. ${item.nome}`, 10, linhaAtual);
            linhaAtual += 7;
            contadorTotal++;

            // Criar nova página se atingir o limite
            if (linhaAtual > 280) {
                doc.addPage();
                linhaAtual = 20;
            }
        }
    });

    doc.save(`sorteio-tufao-${formatarData(dataBusca).replace(/\//g, '-')}.pdf`);
}

// Iniciar datalist ao abrir
atualizarDatalist();