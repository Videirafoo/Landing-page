// Frontend simples do B.A.S.E. - utiliza a API do servidor.js.
const $ = (seletor) => document.querySelector(seletor);
const escapar = (valor) => String(valor ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nomes = {dashboard:'Dashboard', alunos:'Alunos', professores:'Professores', turmas:'Turmas', frequencias:'Frequência', avisos:'Comunicados', usuarios:'Usuários'};
const icones = {dashboard:'▦', alunos:'♙', professores:'♧', turmas:'▤', frequencias:'✓', avisos:'✉', usuarios:'♙'};
const definicoes = {
  alunos: {titulo:'Alunos', subtitulo:'Cadastre e consulte os alunos da escola.', colunas:[['nome','Nome do aluno'],['matricula','Matrícula'],['turma','Turma']], campos:[['nome','Nome do aluno'],['matricula','Matrícula'],['turma','Turma']]},
  professores: {titulo:'Professores', subtitulo:'Organize os docentes e suas disciplinas.', colunas:[['nome','Professor'],['disciplina','Disciplina'],['email','E-mail']], campos:[['nome','Nome do professor'],['disciplina','Disciplina'],['email','E-mail']]},
  turmas: {titulo:'Turmas', subtitulo:'Organize as turmas e seus turnos.', colunas:[['nome','Nome da turma'],['ano','Ano escolar'],['turno','Turno']], campos:[['nome','Nome da turma'],['ano','Ano escolar'],['turno','Turno']]},
  frequencias: {titulo:'Frequência', subtitulo:'Registre presença ou falta dos alunos por dia.', colunas:[['alunoId','Aluno'],['data','Data'],['presente','Situação']], campos:[['alunoId','Aluno'],['data','Data'],['presente','Presença']]},
  avisos: {titulo:'Comunicados', subtitulo:'Registre avisos e recados da instituição.', colunas:[['titulo','Título'],['mensagem','Mensagem'],['criadoEm','Criado em']], campos:[['titulo','Título'],['mensagem','Mensagem']]},
  usuarios: {titulo:'Usuários', subtitulo:'Somente o administrador cadastra novas pessoas com senha.', colunas:[['nome','Nome'],['matricula','Matrícula'],['perfil','Perfil']], campos:[['nome','Nome completo'],['matricula','Matrícula'],['senha','Senha de acesso']]}
};
let estado = {usuario:null, escola:'', secao:'dashboard', alunos:[]};
let tempoToast;

async function requisitar(url, opcoes = {}) {
  const resposta = await fetch(url, {...opcoes, headers:{'Content-Type':'application/json', ...(opcoes.headers || {})}});
  let dados;
  try {dados = await resposta.json();} catch {throw new Error('Servidor não respondeu corretamente.');}
  if (!resposta.ok) throw new Error(dados.erro || 'Não foi possível concluir.');
  return dados;
}
function aviso(mensagem) {
  const el = $('#toast'); el.textContent = mensagem; el.classList.add('ativo');
  clearTimeout(tempoToast); tempoToast = setTimeout(() => el.classList.remove('ativo'), 3000);
}
function dataBR(data) {return data ? new Date(data.length === 10 ? data+'T12:00:00' : data).toLocaleDateString('pt-BR') : '—';}
function mostrarEntrada(configurar) {
  $('#entrada').hidden = false; $('#sistema').hidden = true;
  $('#campos-configuracao').hidden = !configurar;
  $('#entrada-titulo').textContent = configurar ? 'Primeiro acesso' : 'Acessar o sistema';
  $('#entrada-legenda').textContent = configurar ? 'CONFIGURAÇÃO INICIAL' : 'ÁREA RESTRITA';
  $('#entrada-texto').textContent = configurar ? 'Crie a escola e a conta administradora. Depois, só usuários cadastrados poderão entrar.' : 'Entre com sua matrícula e senha cadastradas.';
  $('#btn-acesso').textContent = configurar ? 'Criar acesso administrador' : 'Entrar no sistema';
  $('#senha-acesso').minLength = configurar ? 8 : 1;
  $('#form-acesso').dataset.modo = configurar ? 'configurar' : 'login';
}
function abrirSistema(dados) {
  estado.usuario = dados.usuario; estado.escola = dados.escola;
  $('#entrada').hidden = true; $('#sistema').hidden = false;
  $('#nome-escola').textContent = dados.escola;
  $('#nome-usuario').textContent = dados.usuario.nome;
  $('#perfil-usuario').textContent = dados.usuario.perfil;
  $('#avatar').textContent = dados.usuario.nome.slice(0,1).toUpperCase();
  $('#avatar-topo').textContent = dados.usuario.nome.slice(0,1).toUpperCase();
  construirMenu(); navegar('dashboard');
}
function construirMenu() {
  $('#navegacao').innerHTML = Object.keys(nomes).filter(secao => secao !== 'usuarios' || estado.usuario.perfil === 'Administrador').map(secao => `<button type="button" data-secao="${secao}" class="nav-item"><span class="nav-icone">${icones[secao]}</span>${nomes[secao]}</button>`).join('');
  $('#navegacao').querySelectorAll('button').forEach(b => b.addEventListener('click', () => navegar(b.dataset.secao)));
}
function cabecalho(titulo, descricao, acao='') {
  return `<section class="pagina-cabecalho"><div><h1>${escapar(titulo)}</h1><p>${escapar(descricao)}</p></div><div class="paginas-acoes">${acao}</div></section>`;
}
function metrica(numero, titulo, icone, classe, secao) {
  return `<div class="cartao metrica"><div class="metrica-topo"><div class="metrica-icone ${classe}">${icone}</div><button class="btn-icon" data-atalho="${secao}" aria-label="Abrir ${titulo}">↗</button></div><div><div class="metrica-valor">${numero}</div><div class="metrica-label">${titulo}</div></div></div>`;
}
async function navegar(secao) {
  estado.secao = secao;
  $('#barra-lateral').classList.remove('aberta'); $('#tampa').classList.remove('aberta');
  $('#trilha-atual').textContent = nomes[secao];
  $$('.nav-item');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('ativo', b.dataset.secao === secao));
  $('#conteudo').innerHTML = '<div class="pagina-vazia">Carregando...</div>';
  try {
    if (secao === 'dashboard') await dashboard();
    else await tabela(secao);
  } catch (e) { $('#conteudo').innerHTML = `<div class="cartao pagina-vazia">${escapar(e.message)}</div>`; }
}
function $$(seletor){ return document.querySelectorAll(seletor); }
async function dashboard() {
  const [dados, frequencias] = await Promise.all([requisitar('/api/resumo'), requisitar('/api/frequencias')]);
  const esteAno = new Date().getFullYear();
  const meses = Array.from({length:6}, (_,i) => {
    const d = new Date(esteAno, new Date().getMonth()-5+i,1);
    const chave = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const itens = frequencias.filter(f => f.data.startsWith(chave));
    return {nome:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.',''), total:itens.length, porcentagem:itens.length ? Math.round(itens.filter(f=>f.presente).length/itens.length*100) : 0};
  });
  const grafico = frequencias.length ? `<div class="grafico">${meses.map(m => `<div class="barra-grafico" title="${escapar(m.nome)}: ${m.total ? m.porcentagem+'%' : 'sem registros'}" style="height:${m.total ? m.porcentagem : 0}%"></div>`).join('')}</div><div class="legenda-grafico">${meses.map(m=>`<span>${escapar(m.nome)}</span>`).join('')}</div>` : `<div class="nenhum">Sem frequência cadastrada.<br>Registre presenças para gerar o gráfico.</div>`;
  const avisos = dados.avisos.length ? dados.avisos.map(item => `<div class="aviso-item"><span class="item-icone">✉</span><div><strong>${escapar(item.titulo)}</strong><p>${escapar(item.mensagem)}</p><time>${dataBR(item.criadoEm)}</time></div></div>`).join('') : '<div class="nenhum">Nenhum comunicado cadastrado.</div>';
  const atividades = dados.atividades.length ? dados.atividades.map(item=> `<div class="atividade-item"><span class="item-icone">✓</span><div><strong>${escapar(item.titulo)}</strong><p>${escapar(nomes[item.tipo] || item.tipo)}</p><time>${dataBR(item.criadoEm)}</time></div></div>`).join('') : '<div class="nenhum">Seus cadastros recentes aparecerão aqui.</div>';
  $('#conteudo').innerHTML = cabecalho('Visão geral da escola', 'Acompanhe os principais indicadores da instituição.', '<button class="botao primario" data-atalho="alunos">+ Novo aluno</button>') + `
    <div class="metricas">${metrica(dados.alunos,'Alunos matriculados','♙','azul','alunos')}${metrica(dados.turmas,'Turmas','▤','verde','turmas')}${metrica(dados.professores,'Professores','♧','laranja','professores')}${metrica(dados.frequencia === null ? '—' : dados.frequencia+'%','Frequência média','✓','roxo','frequencias')}</div>
    <div class="grade-principal"><section class="cartao painel"><div class="painel-topo"><h2>Frequência dos alunos</h2><button class="link" data-atalho="frequencias">Ver registros</button></div>${grafico}</section><section class="cartao painel"><div class="painel-topo"><h2>Avisos e comunicados</h2><button class="link" data-atalho="avisos">Ver todos</button></div><div class="lista-avisos">${avisos}</div></section><section class="cartao painel"><div class="painel-topo"><h2>Atividades recentes</h2></div><div class="atividades">${atividades}</div></section><section class="cartao painel"><div class="painel-topo"><h2>Comece por aqui</h2></div><p style="color:#7d90a7;font-size:13px;line-height:1.8">1. Cadastre uma turma.<br>2. Cadastre os alunos e professores.<br>3. Registre a frequência.<br>4. Publique comunicados.<br><br>Registros salvos ${window.BASE_DEMO ? 'somente neste navegador (demonstração).' : 'no arquivo <b>dados/banco.txt</b>.'}</p></section></div>`;
  document.querySelectorAll('[data-atalho]').forEach(el => el.addEventListener('click', () => navegar(el.dataset.atalho)));
}
function mostrarValor(chave, valor) {
  if (chave === 'presente') return valor ? '<span class="tag">Presente</span>' : '<span class="tag nao">Falta</span>';
  if (chave === 'criadoEm' || chave === 'data') return escapar(dataBR(valor));
  if (chave === 'alunoId') return escapar(estado.alunos.find(a => a.id === valor)?.nome || 'Aluno excluído');
  return escapar(valor);
}
async function tabela(secao) {
  const def = definicoes[secao];
  if (!def) return;
  const [registros, alunos] = await Promise.all([requisitar('/api/'+secao), secao === 'frequencias' ? requisitar('/api/alunos') : Promise.resolve([])]);
  if (secao === 'frequencias') estado.alunos = alunos;
  const podeExcluir = secao !== 'usuarios';
  const botoes = `<button class="botao primario" id="adicionar">+ Cadastrar ${secao === 'usuarios' ? 'usuário' : secao === 'frequencias' ? 'frequência' : 'registro'}</button>`;
  $('#conteudo').innerHTML = cabecalho(def.titulo,def.subtitulo,botoes) + `<div class="cartao tabela-painel"><div class="barra-tabela"><span>${registros.length} registro(s)</span><input id="busca" class="pesquisa" type="search" placeholder="Buscar nesta lista..." aria-label="Buscar"></div><div class="tabela-container"><table class="tabela"><thead><tr>${def.colunas.map(c=>`<th>${escapar(c[1])}</th>`).join('')}${podeExcluir ? '<th>Ações</th>' : ''}</tr></thead><tbody id="linhas"></tbody></table></div></div>`;
  function renderLinhas(filtro='') {
    const filtrados = registros.filter(r => Object.values(r).some(v=>String(v).toLowerCase().includes(filtro.toLowerCase())) || (secao === 'frequencias' && estado.alunos.some(a => a.id === r.alunoId && a.nome.toLowerCase().includes(filtro.toLowerCase()))));
    $('#linhas').innerHTML = filtrados.length ? filtrados.map(registro => `<tr>${def.colunas.map(([campo])=>`<td class="${campo === def.colunas[0][0] ? 'primeira-coluna' : ''}">${mostrarValor(campo, registro[campo])}</td>`).join('')}${podeExcluir ? `<td><button class="btn-excluir" data-excluir="${escapar(registro.id)}">Excluir</button></td>` : ''}</tr>`).join('') : `<tr><td colspan="${def.colunas.length + (podeExcluir?1:0)}"><div class="pagina-vazia"><strong>Sem registros</strong>Cadastre um novo registro para começar.</div></td></tr>`;
    $$('#linhas [data-excluir]').forEach(b => b.addEventListener('click', async () => {
      if (!confirm('Deseja excluir este registro?')) return;
      try {await requisitar('/api/'+secao+'/'+b.dataset.excluir,{method:'DELETE'}); aviso('Registro excluído.'); tabela(secao);} catch(e) {aviso(e.message);}
    }));
  }
  renderLinhas();
  $('#busca').addEventListener('input', e=>renderLinhas(e.target.value));
  $('#adicionar').addEventListener('click', ()=>abrirCadastro(secao));
}
function campoHTML(chave, rotulo) {
  const atributos = `name="${chave}" id="campo-${chave}" required`;
  if (chave === 'alunoId') return `<label>${rotulo}<select ${atributos}>${estado.alunos.length ? '<option value="">Selecione um aluno</option>'+estado.alunos.map(a=>`<option value="${escapar(a.id)}">${escapar(a.nome)}</option>`).join('') : '<option value="">Cadastre um aluno primeiro</option>'}</select></label>`;
  if (chave === 'presente') return `<label>${rotulo}<select ${atributos}><option value="true">Presente</option><option value="false">Faltou</option></select></label>`;
  if (chave === 'mensagem') return `<label>${rotulo}<textarea ${atributos} maxlength="400" placeholder="Texto do comunicado"></textarea></label>`;
  const tipo = chave === 'data' ? 'date' : chave === 'email' ? 'email' : chave === 'senha' ? 'password' : 'text';
  const extra = chave === 'senha' ? 'minlength="8" autocomplete="new-password" placeholder="No mínimo 8 caracteres"' : chave === 'data' ? `value="${new Date().toLocaleDateString('en-CA')}"` : '';
  return `<label>${rotulo}<input ${atributos} type="${tipo}" ${extra} maxlength="150" placeholder="${escapar(rotulo)}"></label>`;
}
function abrirCadastro(secao) {
  const def = definicoes[secao];
  $('#janela-titulo').textContent = 'Cadastrar ' + (secao === 'usuarios' ? 'usuário' : def.titulo.toLowerCase());
  $('#janela-campos').innerHTML = def.campos.map(c => campoHTML(...c)).join('');
  $('#janela-erro').textContent = '';
  $('#form-registro').dataset.secao = secao;
  $('#janela').showModal();
}
async function inicializar() {
  try {
    const inicio = await requisitar('/api/inicio');
    if (!inicio.configurado) return mostrarEntrada(true);
    try { abrirSistema(await requisitar('/api/me')); }
    catch { mostrarEntrada(false); }
  } catch { mostrarEntrada(false); $('#erro-entrada').textContent = window.BASE_DEMO ? 'Erro ao iniciar a demonstração no navegador.' : 'Servidor não disponível. Execute node servidor.js no terminal.'; }
}
$('#form-acesso').addEventListener('submit', async event => {
  event.preventDefault(); $('#erro-entrada').textContent = '';
  const botao = $('#btn-acesso'); botao.disabled = true;
  const dados = Object.fromEntries(new FormData(event.currentTarget));
  try { abrirSistema(await requisitar('/api/'+event.currentTarget.dataset.modo,{method:'POST',body:JSON.stringify(dados)})); }
  catch(e){ $('#erro-entrada').textContent = e.message; }
  finally{ botao.disabled = false; }
});
$('#mostrar-senha').addEventListener('change', e => $('#senha-acesso').type = e.target.checked ? 'text' : 'password');
$('#form-registro').addEventListener('submit', async e => {
  e.preventDefault();
  const secao = e.currentTarget.dataset.secao;
  const dados = Object.fromEntries(new FormData(e.currentTarget));
  if (secao === 'frequencias') dados.presente = dados.presente === 'true';
  try {await requisitar('/api/'+secao,{method:'POST',body:JSON.stringify(dados)}); $('#janela').close(); aviso(window.BASE_DEMO ? 'Cadastro salvo neste navegador.' : 'Cadastro salvo no arquivo TXT.'); navegar(secao);}
  catch(err){ $('#janela-erro').textContent = err.message; }
});
$('#fechar-janela').addEventListener('click',()=>$('#janela').close());
$('#cancelar').addEventListener('click',()=>$('#janela').close());
$('#btn-sair').addEventListener('click', async ()=>{
  try {await requisitar('/api/sair',{method:'POST'});} catch{}
  estado = {usuario:null,escola:'',secao:'dashboard',alunos:[]};
  $('#form-acesso').reset(); mostrarEntrada(false);
});
$('#btn-menu').addEventListener('click',()=>{$('#barra-lateral').classList.add('aberta');$('#tampa').classList.add('aberta');});
$('#tampa').addEventListener('click',()=>{$('#barra-lateral').classList.remove('aberta');$('#tampa').classList.remove('aberta');});
inicializar();
