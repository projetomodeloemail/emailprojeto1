

const Key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkYW5vb3Rrb2FmZGhveW9ia3pwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDE0MDY2MywiZXhwIjoyMDE1NzE2NjYzfQ.e44Su-sEHw12cz9j_cmi1CY93ThLDVxJ6hLfCzmWF54';
const Url = 'https://fdanootkoafdhoyobkzp.supabase.co';


const database = supabase.createClient(Url, Key);





// Função para copiar modelos
function copiarModelo(textoModelo) {
  try {
    // Crie um elemento temporário para armazenar o texto formatado
    const tempElement = document.createElement('div');
    tempElement.innerHTML = textoModelo;

    // Adicione o elemento temporário ao corpo do documento
    document.body.appendChild(tempElement);

    // Selecione o texto no elemento temporário
    const range = document.createRange();
    range.selectNodeContents(tempElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Execute o comando de cópia
    document.execCommand('copy');

    // Limpe a seleção e remova o elemento temporário
    selection.removeAllRanges();
    document.body.removeChild(tempElement);

    alert("Modelo copiado para a área de transferência!");
  } catch (err) {
    console.error('Erro ao copiar modelo:', err);
    alert('Erro ao copiar o modelo. Consulte o console para obter mais detalhes.');
  }
}















// Função para exibir modelos
function exibirModelos(departamento, departamentoNome) {
  const departamentos = ["privado", "corporativo", "regional", "publicos", "cofres"];

  departamentos.forEach((dep) => {
    const container = document.getElementById(`${dep}Container`);
    const modelos = container.querySelectorAll(".modelo-container");

    if (departamento === "todos" || departamento === dep) {
      modelos.forEach((modelo) => (modelo.style.display = "block"));
    } else {
      modelos.forEach((modelo) => (modelo.style.display = "none"));
    }
  });





  // Atualize a indicação da aba atual
  document.getElementById("aba-atual").textContent = departamentoNome;
  document.getElementById("busca").value = ""; // Limpar o campo de busca
}




// Função para excluir um modelo específico
async function excluirModelo(modeloId) {
  const modeloContainer = document.getElementById(modeloId);
  modeloContainer.remove();






  // Remova o modelo do Supabase
  try {
    const { data, error } = await database
      .from('modelos')
      .delete()
      .eq('id', modeloId);  // Use delete() em vez de upsert()

    if (error) {
      console.error('Erro ao excluir o modelo:', error);
      alert('Erro ao excluir o modelo. Consulte o console para obter mais detalhes.');
    } else {
      alert('Modelo excluído com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao excluir o modelo:', error);
    alert('Erro ao excluir o modelo. Consulte o console para obter mais detalhes.');
  }
}




// Função para exibir o formulário para adicionar modelos
function exibirFormulario() {
  var formulario = document.getElementById("modelo-form");
  formulario.style.display = "block";

  // Obter o departamento selecionado no formulário
  const departamentoSelecionado = document.getElementById("departamento").value;

  // Mover o formulário para o topo do contêiner do departamento selecionado
  const container = document.getElementById(`${departamentoSelecionado}Container`);
  container.prepend(formulario);

  // Resetar os campos do formulário
  document.querySelector("form").reset();
}







// Função para limpar o formulário e redefinir os valores
function limparFormulario() {
  document.getElementById("modelo-form").style.display = "none";
  document.querySelector("form").reset();
  document.getElementById("titulo").value = ""; // Limpar o valor do título
  document.getElementById("texto").innerHTML = ""; // Limpar o valor do texto
}

document.querySelector("form").addEventListener("submit", async function (event) {
  event.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const departamento = document.getElementById("departamento").value;
  const texto = document.getElementById("texto").innerHTML;

  if (!titulo || !departamento || !texto) {
    alert("Por favor, preencha todos os campos.");
    return;
  }

  await adicionarModelo(titulo, departamento, texto);

  limparFormulario();
});





// Função para adicionar um modelo
async function adicionarModelo(titulo, departamento, texto) {
  const departamentosAceitos = ["privado", "corporativo", "regional", "publicos", "cofres"];

  if (!departamentosAceitos.includes(departamento)) {
    alert(
      "Departamento inválido. Os departamentos aceitos são: privado, corporativo, regional, publicos, cofres."
    );
    return;
  }

  // Crie um elemento temporário para armazenar o texto formatado
  const tempElement = document.createElement('div');
  tempElement.innerHTML = texto;

  // Obtenha o texto formatado
  const textoFormatado = tempElement.innerHTML;

  // Adicione o modelo ao Supabase
  try {
    const { data, error } = await database
      .from('modelos')
      .insert([{ titulo, departamento, texto: textoFormatado }]);

    if (error) {
      console.error('Erro ao adicionar o modelo:', error);
      alert('Erro ao adicionar o modelo. Consulte o console para obter mais detalhes.');
    } else {
      alert('Modelo adicionado com sucesso!');
      carregarModelos(); // Recarrega os modelos após adição
      
      // Aguarde 1 segundo antes de recarregar a página
      setTimeout(function() {
        location.reload(); // Recarrega a página
      }, 1000);
    }
  } catch (error) {
    console.error('Erro ao adicionar o modelo:', error);
    alert('Erro ao adicionar o modelo. Consulte o console para obter mais detalhes.');
  }
}







// Função para editar um modelo específico
async function editarModelo(modeloId) {
  try {
    // Obtenha o modelo do Supabase para edição
    const { data, error } = await database
      .from('modelos')
      .select('id, titulo, departamento, texto')
      .eq('id', modeloId)
      .single();

    if (error) {
      console.error('Erro ao obter o modelo para edição:', error);
      alert('Erro ao obter o modelo para edição. Consulte o console para obter mais detalhes.');
      return;
    }

    // Pergunte ao usuário por novos dados
    const novoTitulo = prompt("Novo título:", data.titulo);
    const novoTexto = prompt("Novo texto:", data.texto);

    // Verifique se o usuário forneceu dados válidos
    if (novoTitulo !== null && novoTexto !== null) {
      // Salve as alterações no banco de dados
      await salvarAlteracoesModelo(modeloId, novoTitulo, novoTexto);

      // Atualize a visualização (opcional)
      atualizarTitulo(modeloId);
    } else {
      alert("Edição cancelada pelo usuário.");
    }
  } catch (error) {
    console.error('Erro ao editar o modelo:', error);
    alert('Erro ao editar o modelo. Consulte o console para obter mais detalhes.');
  }
}

// Função para salvar as alterações em um modelo específico
async function salvarAlteracoesModelo(modeloId, novoTitulo, novoTexto) {
  try {
    // Atualize os dados no Supabase
    const { data, error } = await database
      .from('modelos')
      .update({ titulo: novoTitulo, texto: novoTexto })
      .eq('id', modeloId);

    if (error) {
      console.error('Erro ao salvar as alterações no modelo:', error);
      alert('Erro ao salvar as alterações no modelo. Consulte o console para obter mais detalhes.');
    } else {
      alert('Alterações salvas com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao salvar as alterações no modelo:', error);
    alert('Erro ao salvar as alterações no modelo. Consulte o console para obter mais detalhes.');
  }
}




// Função para buscar modelos
function buscarModelos() {
  const busca = document.getElementById("busca").value.toLowerCase();
  const modelos = document.querySelectorAll(".modelo-container");

  modelos.forEach((modelo) => {
    const titulo = modelo
      .querySelector("h2 .titulo-editavel")
      .textContent.toLowerCase();
    if (titulo.includes(busca)) {
      modelo.style.display = "block";
    } else {
      modelo.style.display = "none";
    }
  });
}




// Função para atualizar o título de um modelo
function atualizarTitulo(modeloId) {
  const modeloContainer = document.getElementById(modeloId);
  const novoTitulo = modeloContainer.querySelector(
    "h2 .titulo-editavel"
  ).textContent;
  modeloContainer.querySelector("h2 span.titulo-editavel").textContent =
    novoTitulo;
}





// Função para excluir modelos selecionados
async function excluirModelosSelecionados() {
  const checkboxes = document.querySelectorAll(".modelo-checkbox");

  const modelosSelecionados = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.getAttribute("data-modelo"));

  if (modelosSelecionados.length === 0) {
    alert("Selecione pelo menos um modelo para excluir.");
    return;
  }

  try {
    const { data, error } = await database
      .from('modelos')
      .delete()
      .in('id', modelosSelecionados);

    if (error) {
      console.error('Erro ao excluir modelos:', error);
      alert('Erro ao excluir modelos. Consulte o console para obter mais detalhes.');
    } else {
      alert('Modelos excluídos com sucesso!');
      carregarModelos(); // Recarrega os modelos após a exclusão
    }
  } catch (error) {
    console.error('Erro ao excluir modelos:', error);
    alert('Erro ao excluir modelos. Consulte o console para obter mais detalhes.');
  }
}


// funçao carregarModelos

async function carregarModelos() {
  try {
    const { data, error } = await database
      .from('modelos')
      .select('id, titulo, departamento, texto');

    if (error) {
      console.error('Erro ao carregar modelos:', error);
      alert('Erro ao carregar modelos. Consulte o console para obter mais detalhes.');
    } else {
      // Limpe os contêineres de modelos existentes antes de adicionar os novos
      const departamentos = ["privado", "corporativo", "regional", "publicos", "cofres"];
      departamentos.forEach((dep) => {
        const container = document.getElementById(`${dep}Container`);
        container.innerHTML = '';
      });





      // Adicione os modelos aos contêineres apropriados
      data.forEach((modelo) => {
        const container = document.getElementById(`${modelo.departamento}Container`);
        const modeloHtml = criarModeloHtml(modelo);
        container.appendChild(modeloHtml);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar modelos:', error);
    alert('Erro ao carregar modelos. Consulte o console para obter mais detalhes.');
  }
}






// Chame carregarModelos quando a página é carregada
document.addEventListener("DOMContentLoaded", carregarModelos);





// Função auxiliar para criar o HTML de um modelo
function criarModeloHtml(modelo) {
  const modeloHtml = document.createElement('div');
  modeloHtml.classList.add('modelo-container');

  
  modeloHtml.innerHTML = `
  <input type="checkbox" class="modelo-checkbox" data-modelo="${modelo.id}">
  <h2>
    <span class="titulo-editavel">${modelo.titulo}</span>
    <button class="botaoeditar" onclick="editarModelo('${modelo.id}')">Editar</button>
  </h2>
  <p>${modelo.texto}</p>
  <button class="copiarmodelo" onclick="copiarModelo('${modelo.texto}')">Copiar Modelo</button>
`;

  return modeloHtml;
}

