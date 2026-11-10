function selecionar(seletor) {
  return document.querySelector(seletor);
}

function selecionarTodos(seletor) {
  return document.querySelectorAll(seletor);
}
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hoje = () => new Date().toLocaleDateString('en-CA');
const dataBR = v => v ? new Date(v.length === 10 ? v+'T12:00:00' : v).toLocaleDateString('pt-BR') : '—';
const N = {
  dashboard:'Dashboard', alunos:'Alunos', matriculas:'Matrículas', turmas:'Turmas', professores:'Professores',
  frequencias:'Frequência', avaliacoes:'Avaliações', conteudos:'Conteúdos', avisos:'Comunicados',
  relatorios:'Relatórios', indicadores:'Indicadores', configuracoes:'Configurações', usuarios:'Usuários'
};
const D = {
  alunos: {titulo:'Alunos',desc:'Gerencie os alunos da escola.', cols:[['nome','Aluno'],['matricula','Matrícula'],['turma','Turma']],campos:[['nome','Nome do aluno'],['matricula','Matrícula do aluno'],['turma','Turma / série']]},
  matriculas:{titulo:'Matrículas',desc:'Vincule alunos a turmas.',cols:[['alunoId','Aluno'],['turmaId','Turma'],['data','Data da matrícula']],campos:[['alunoId','Aluno'],['turmaId','Turma'],['data','Data']]},
  turmas:{titulo:'Turmas',desc:'Organize suas turmas e turnos.',cols:[['nome','Turma'],['ano','Ano / série'],['turno','Turno']],campos:[['nome','Nome da turma'],['ano','Ano / série'],['turno','Turno']]},
  professores:{titulo:'Professores',desc:'Cadastre os professores e suas disciplinas.',cols:[['nome','Professor'],['disciplina','Disciplina'],['email','E-mail']],campos:[['nome','Nome'],['disciplina','Disciplina'],['email','E-mail']]},
  frequencias:{titulo:'Frequência',desc:'Registre presenças e faltas por data.',cols:[['alunoId','Aluno'],['data','Data'],['presente','Situação']],campos:[['alunoId','Aluno'],['data','Data'],['presente','Situação']]},
  avaliacoes:{titulo:'Avaliações',desc:'Registre notas de 0 a 10 por disciplina.',cols:[['alunoId','Aluno'],['disciplina','Disciplina'],['nota','Nota'],['data','Data']],campos:[['alunoId','Aluno'],['disciplina','Disciplina'],['nota','Nota'],['data','Data']]},
  conteudos:{titulo:'Conteúdos',desc:'Registre os conteúdos abordados em aula.',cols:[['titulo','Conteúdo'],['disciplina','Disciplina'],['data','Data']],campos:[['titulo','Título'],['disciplina','Disciplina'],['descricao','Descrição'],['data','Data']]},
  avisos:{titulo:'Comunicados',desc:'Publique avisos para a escola.',cols:[['titulo','Título'],['mensagem','Mensagem'],['criadoEm','Publicado']],campos:[['titulo','Título'],['mensagem','Mensagem']]},
  usuarios:{titulo:'Usuários',desc:'Apenas o administrador cadastra acessos.',cols:[['nome','Nome'],['matricula','Matrícula'],['perfil','Perfil']],campos:[['nome','Nome completo'],['matricula','Matrícula de acesso'],['senha','Senha (mínimo 8 caracteres)']]}
};
const cores=['#2b7bea','#34bf76','#f5a424','#9254de','#11baba','#e75197'];
let estado={usuario:null,escola:'',pagina:'dashboard',alunos:[],turmas:[]};
let timeout;
const emDemo=Boolean(window.BASE_STATIC_DEMO);
const baseDemo = emDemo ? location.pathname.replace(/(?:index\.html)?$/, "") : "";
const destino=rota=>emDemo?baseDemo+(rota==="/cadastrar"?"?acao=cadastrar":""):rota;

async function api(url,op={}){
  const r=await fetch(url,{...op,headers:{'Content-Type':'application/json',...(op.headers||{})},credentials:'same-origin'});
  let d;try{d=await r.json();}catch{throw Error('Resposta inválida do servidor.');}
  if(!r.ok){if(r.status===401&&estado.usuario){estado.usuario=null;history.replaceState(null,'',destino('/entrar'));entrarTela(false);}throw Error(d.erro||'Erro ao executar operação.');}
  return d;
}
function alerta(msg){const el=selecionar('#toast');el.textContent=msg;el.classList.add('mostrar');clearTimeout(timeout);timeout=setTimeout(()=>el.classList.remove('mostrar'),3500);}
function entrarTela(configurar){
  document.title='B.A.S.E. | '+(configurar?'Cadastrar escola':'Entrar');
  selecionar('#aplicacao').hidden=true;selecionar('#acesso').hidden=false;
  selecionar('#campos-iniciais').hidden=!configurar;
  selecionar('#form-acesso').dataset.modo=configurar?'cadastrar':'login';
  selecionar('#link-cadastrar').hidden=configurar;selecionar('#link-entrar').hidden=!configurar;
  selecionar('#acesso-titulo').textContent=configurar?'Cadastrar escola':'Acesso ao sistema';
  selecionar('#acesso-tipo').textContent=configurar?'NOVO CADASTRO':'ÁREA RESTRITA';
  selecionar('#acesso-desc').textContent=configurar?'Cadastre sua escola e crie seu acesso.':'Entre com matrícula e senha. Cada escola acessa apenas seus dados.';
  selecionar('#acesso-enviar').textContent=configurar?'Cadastrar escola':'Entrar';
  selecionar('#senha').minLength=configurar?8:1;
  selecionar('#acesso-erro').textContent='';
}
function entrarApp(d){
  document.title='B.A.S.E. | Dashboard';
  estado.usuario=d.usuario;estado.escola=d.escola;
  selecionar('#acesso').hidden=true;selecionar('#aplicacao').hidden=false;
  selecionar('#escola-nome').textContent=d.escola;
  selecionar('#usuario-nome').textContent=d.usuario.nome;
  selecionar('#usuario-perfil').textContent=d.usuario.perfil;
  selecionar('#avatar').textContent=d.usuario.nome.charAt(0).toUpperCase();
  selecionar('#avatar-topo').textContent=d.usuario.nome.charAt(0).toUpperCase();
  history.replaceState(null,'',destino('/painel'));
  montarMenu(); navegar('dashboard');
}
function montarMenu() {
  const menu = selecionar('#menu');
  const paginas = Object.keys(N).filter(pagina =>
    pagina !== 'usuarios' || estado.usuario.perfil === 'Administrador'
  );

  menu.innerHTML = paginas.map(pagina => `
    <button class="item-menu" type="button" data-pagina="${pagina}" title="${N[pagina]}">
      <span class="item-icone" aria-hidden="true"></span>
      <span>${N[pagina]}</span>
    </button>
  `).join('');

  selecionarTodos('#menu [data-pagina]').forEach(botao => {
    botao.onclick = () => navegar(botao.dataset.pagina);
  });
}

function fecharMenu() {
  selecionar('#menu-lateral').classList.remove('aberto');
  selecionar('#sombra-menu').classList.remove('aberto');
  selecionar('#abrir-menu').setAttribute('aria-expanded', 'false');
}

async function navegar(pagina) {
  fecharMenu();
  estado.pagina = pagina;

  selecionar('#topo-titulo').textContent = N[pagina];
  selecionar('#topo-legenda').textContent = pagina === 'dashboard'
    ? 'Visão geral da sua escola'
    : 'Base de Acompanhamento do Sistema Escolar';

  selecionarTodos('#menu .item-menu').forEach(botao => {
    const ativo = botao.dataset.pagina === pagina;
    botao.classList.toggle('ativo', ativo);

    if (ativo) {
      botao.setAttribute('aria-current', 'page');
    } else {
      botao.removeAttribute('aria-current');
    }
  });

  const conteudo = selecionar('#conteudo');
  conteudo.innerHTML = '<div class="centro-vazio">Carregando...</div>';

  try {
    if (pagina === 'dashboard') await dashboard();
    else if (D[pagina]) await listagem(pagina);
    else if (pagina === 'relatorios') await relatorios();
    else if (pagina === 'indicadores') await indicadores();
    else if (pagina === 'configuracoes') configuracoes();
  } catch (erro) {
    conteudo.innerHTML = `<section class="cartao centro-vazio">${esc(erro.message)}</section>`;
  }
}

function topo(t,desc,acoes=''){
  return `<div class="pagina-topo"><div><h1>${esc(t)}</h1><p>${esc(desc)}</p></div><div class="pagina-acoes">${acoes}</div></div>`;
}
function kpi(numero,texto,icone,cor,link){return `<button class="kpi cartao" type="button" data-ir="${link}"><div class="kpi-icone" style="--cor:${cor}"><span class="kpi-svg" data-icone="${icone}" aria-hidden="true"></span></div><div><small>${esc(texto)}</small><strong>${esc(numero)}</strong><em>Ver registros ↗</em></div></button>`;}
function painel(titulo,acoes,conteudo){return `<section class="cartao painel"><header class="painel-topo"><h2>${titulo}</h2>${acoes||''}</header>${conteudo}</section>`;}
function vazio(texto,tipo=''){const imagens={frequencia:'vazio-frequencia.svg',comunicados:'vazio-comunicados.svg',desempenho:'vazio-desempenho.svg',atividades:'vazio-atividades.svg'};const arquivo=imagens[tipo];const base=emDemo?'../sistema-saas/public/assets/':'/assets/';return `<div class="vazio vazio-ilustrado">${arquivo?`<img src="${base+arquivo}" alt="" loading="lazy">`:''}<span>${esc(texto)}</span></div>`;} 
function meses6(){return Array.from({length:6},(_,i)=>{const d=new Date(new Date().getFullYear(),new Date().getMonth()-5+i,1);return {id:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,nome:d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}});}
function graficoLinha(frequencias){
  if(!frequencias.length)return vazio('Registre presenças e faltas para visualizar o gráfico.','frequencia');
  const meses=meses6();let total=0;
  const serie=meses.map(m=>{const itens=frequencias.filter(f=>f.data.startsWith(m.id));total+=itens.length;return {nome:m.nome,presencas:itens.length?itens.filter(f=>f.presente).length/itens.length*100:null,faltas:itens.length?itens.filter(f=>!f.presente).length/itens.length*100:null};});
  if(!total)return vazio('Sem registros de frequência nos últimos seis meses.','frequencia');
  function trajetoria(chave){return serie.map((m,i)=>m[chave]===null?null:[28+i*104,160-m[chave]*1.25]).reduce((a,pt)=>{if(pt===null){a.abrir=true;return a;}a.d+=`${a.abrir?'M':'L'}${pt[0]} ${pt[1]} `;a.abrir=false;return a;},{d:'',abrir:true}).d;}
  const pontos=serie.flatMap((m,i)=>[['presencas','#39bd80'],['faltas','#ec7181']].filter(([ch])=>m[ch]!==null).map(([ch,cor])=>`<circle cx="${28+i*104}" cy="${160-m[ch]*1.25}" r="4" fill="${cor}" stroke="white" stroke-width="2"/>`)).join('');
  return `<div class="legenda"><span><i style="background:#39bd80"></i>Presenças</span><span><i style="background:#ec7181"></i>Faltas</span></div><div class="svg-grafico"><svg viewBox="0 0 580 205" role="img" aria-label="Percentuais mensais de presença e faltas"><g stroke="#e9eef4" stroke-width="1">${[35,66,97,128,160].map(y=>`<line x1="28" y1="${y}" x2="558" y2="${y}"/>`).join('')}</g><path d="${trajetoria('presencas')}" fill="none" stroke="#39bd80" stroke-width="3" stroke-linecap="round"/><path d="${trajetoria('faltas')}" fill="none" stroke="#ec7181" stroke-width="3" stroke-linecap="round"/>${pontos}${serie.map((m,i)=>`<text x="${28+i*104}" y="192" text-anchor="middle" font-size="12" fill="#8493a7">${esc(m.nome)}</text>`).join('')}</svg></div>`;
}
function graficoBarras(avaliacoes){
  if(!avaliacoes.length)return vazio('Cadastre avaliações e notas para visualizar as disciplinas.','desempenho');
  const grupos={};for(const a of avaliacoes){(grupos[a.disciplina] ||= []).push(Number(a.nota));}
  const medias=Object.entries(grupos).slice(0,6).map(([nome,notas])=>({nome,media:notas.reduce((a,b)=>a+b,0)/notas.length}));
  return `<div class="barras">${medias.map((v,i)=>`<div class="barra-item" title="${esc(v.nome)}: ${v.media.toFixed(1)}/10"><div class="barra-trilho"><div class="barra-cor" style="height:${v.media*10}%;background:${cores[i]}"></div></div><strong>${esc(v.nome)}</strong><small>${v.media.toFixed(1)}</small></div>`).join('')}</div>`;
}
async function dashboard(){
  const [resumo,freq,aval]=await Promise.all([api('/api/resumo'),api('/api/frequencias'),api('/api/avaliacoes')]);
  const avisos=resumo.avisos.length?resumo.avisos.map(a=>`<div class="linha-atividade"><span class="bloco-icon azul"><span class="mini-svg" data-icone="avisos" aria-hidden="true"></span></span><div><b>${esc(a.titulo)}</b><p>${esc(a.mensagem)}</p></div><small>${dataBR(a.criadoEm)}</small></div>`).join(''):vazio('Nenhum comunicado cadastrado.','comunicados');
  const atividades=resumo.atividades.length?resumo.atividades.map(a=>`<div class="linha-atividade"><span class="bloco-icon verde"><span class="mini-svg" data-icone="avaliacoes" aria-hidden="true"></span></span><div><b>${esc(a.titulo)}</b><p>${esc(N[a.tipo]||a.tipo)}</p></div><small>${dataBR(a.criadoEm)}</small></div>`).join(''):vazio('Os registros recentes aparecerão aqui.','atividades');
  selecionar('#conteudo').innerHTML=`<div class="metricas">
    ${kpi(resumo.alunos,'Alunos matriculados','alunos','#2775db','alunos')}
    ${kpi(resumo.turmas,'Turmas','turmas','#2fbe6b','turmas')}
    ${kpi(resumo.professores,'Professores','professores','#eda019','professores')}
    ${kpi(resumo.frequencia===null?'—':resumo.frequencia+'%','Frequência média','frequencias','#954de3','frequencias')}
  </div><div class="grade-paineis">
    ${painel('Frequência dos Alunos','<button class="link-texto" data-ir="frequencias">Últimos 6 meses ↗</button>',graficoLinha(freq))}
    ${painel('Avisos e Comunicados','<button class="link-texto" data-ir="avisos">Ver todos</button>',`<div class="lista-interior">${avisos}</div>`)}
    ${painel('Desempenho por Disciplina','<button class="link-texto" data-ir="avaliacoes">Ver notas</button>',graficoBarras(aval))}
    ${painel('Atividades Recentes','<button class="link-texto" data-ir="relatorios">Ver todas</button>',`<div class="lista-interior">${atividades}</div>`)}
  </div>`;
  selecionarTodos('#conteudo [data-ir]').forEach(b=>b.onclick=()=>navegar(b.dataset.ir));
}
function nomeRelacao(c,v){
  if(c==='alunoId')return estado.alunos.find(a=>a.id===v)?.nome||'Aluno removido';
  if(c==='turmaId')return estado.turmas.find(t=>t.id===v)?.nome||'Turma removida';
  if(c==='presente')return v?'<span class="status presente">Presente</span>':'<span class="status falta">Falta</span>';
  if(c==='data'||c==='criadoEm')return esc(dataBR(v));
  if(c==='nota')return esc(Number(v).toFixed(1));
  return esc(v);
}
async function listagem(p){
  const def=D[p];const [lista,alunos,turmas]=await Promise.all([api('/api/'+p),api('/api/alunos'),api('/api/turmas')]);
  estado.alunos=alunos;estado.turmas=turmas;
  const acoes=`<button id="novo" class="botao primaria">+ Novo cadastro</button>`;
  selecionar('#conteudo').innerHTML=topo(def.titulo,def.desc,acoes)+`<section class="cartao tabela-cartao"><div class="busca-linha"><span>${lista.length} registro(s)</span><input type="search" id="buscar" placeholder="Buscar registros" aria-label="Buscar registros"></div><div class="tabela-scroll"><table><thead><tr>${def.cols.map(c=>`<th>${esc(c[1])}</th>`).join('')}${p==='usuarios'?'':'<th>Ações</th>'}</tr></thead><tbody id="registros"></tbody></table></div></section>`;
  function linhas(busca=''){
    const reg=lista.filter(a=>(JSON.stringify(a)+' '+(estado.alunos.find(x=>x.id===a.alunoId)?.nome||'')).toLowerCase().includes(busca.toLowerCase()));
    selecionar('#registros').innerHTML=reg.length?reg.map(a=>`<tr>${def.cols.map(([c])=>`<td>${nomeRelacao(c,a[c])}</td>`).join('')}${p==='usuarios'?'':`<td><button class="apagar" data-id="${esc(a.id)}">Excluir</button></td>`}</tr>`).join(''):`<tr><td colspan="${def.cols.length+1}">${vazio('Nenhum registro encontrado.')}</td></tr>`;
    selecionarTodos('#registros [data-id]').forEach(b=>b.onclick=async()=>{
      if(!confirm('Excluir este registro?'))return;
      try{await api('/api/'+p+'/'+encodeURIComponent(b.dataset.id),{method:'DELETE'});alerta('Registro excluído.');navegar(p);}catch(e){alerta(e.message);}
    });
  }
  linhas();selecionar('#buscar').oninput=e=>linhas(e.target.value);selecionar('#novo').onclick=()=>abrirCadastro(p);
}
function campo(chave,nome){
  if(chave==='alunoId')return `<label>${esc(nome)}<select name="${chave}" required><option value="">Selecione um aluno</option>${estado.alunos.map(a=>`<option value="${esc(a.id)}">${esc(a.nome)}</option>`).join('')}</select></label>`;
  if(chave==='turmaId')return `<label>${esc(nome)}<select name="${chave}" required><option value="">Selecione uma turma</option>${estado.turmas.map(t=>`<option value="${esc(t.id)}">${esc(t.nome)}</option>`).join('')}</select></label>`;
  if(chave==='presente')return `<label>${esc(nome)}<select name="presente"><option value="true">Presente</option><option value="false">Falta</option></select></label>`;
  if(['mensagem','descricao'].includes(chave))return `<label>${esc(nome)}<textarea name="${chave}" maxlength="400" required></textarea></label>`;
  const tipo={data:'date',email:'email',senha:'password',nota:'number'}[chave]||'text';
  const extra=chave==='data'?`value="${hoje()}"`:chave==='senha'?'minlength="8" autocomplete="new-password"':chave==='nota'?'min="0" max="10" step="0.1"':'';
  return `<label>${esc(nome)}<input name="${chave}" type="${tipo}" ${extra} maxlength="150" required placeholder="${esc(nome)}"></label>`;
}
function abrirCadastro(p){
  selecionar('#modal-titulo').textContent='Novo registro • '+D[p].titulo;
  selecionar('#modal-campos').innerHTML=D[p].campos.map(([c,n])=>campo(c,n)).join('');
  selecionar('#modal-erro').textContent='';selecionar('#form-cadastro').dataset.pagina=p;selecionar('#modal').showModal();
}
async function relatorios(){
  const resumo=await api('/api/resumo');
  selecionar('#conteudo').innerHTML=topo('Relatórios','Resumo da escola com informações do banco TXT.','<button id="imprimir" class="botao primaria">Imprimir relatório</button>')+`<div class="cartao resumo-cartao"><h2>${esc(estado.escola)}</h2><p>Data: ${dataBR(hoje())}</p><div class="resumo-linhas"><span>Alunos cadastrados <b>${resumo.alunos}</b></span><span>Turmas <b>${resumo.turmas}</b></span><span>Professores <b>${resumo.professores}</b></span><span>Frequência média <b>${resumo.frequencia===null?'Sem registros':resumo.frequencia+'%'}</b></span></div></div>`;
  selecionar('#imprimir').onclick=()=>window.print();
}
async function indicadores(){
  const [r,avs,fr]=await Promise.all([api('/api/resumo'),api('/api/avaliacoes'),api('/api/frequencias')]);
  const media=avs.length?(avs.reduce((s,v)=>s+Number(v.nota),0)/avs.length).toFixed(1):'—';
  selecionar('#conteudo').innerHTML=topo('Indicadores','Todos os dados são calculados a partir dos cadastros.')+`<div class="metricas">${kpi(r.alunos,'Alunos','♙','#2775db','alunos')}${kpi(r.turmas,'Turmas','▥','#2fbe6b','turmas')}${kpi(fr.length,'Registros de frequência','✓','#eda019','frequencias')}${kpi(media,'Média das avaliações','◎','#954de3','avaliacoes')}</div>`+painel('Notas por disciplina',null,graficoBarras(avs));
  selecionarTodos('#conteudo [data-ir]').forEach(b=>b.onclick=()=>navegar(b.dataset.ir));
}
function configuracoes(){
  const admin=estado.usuario.perfil==='Administrador';
  selecionar('#conteudo').innerHTML=topo('Configurações','Dados básicos desta escola.')+`<div class="cartao configuracoes-cartao"><h2>Nome da instituição</h2><form id="form-escola"><label>Escola<input name="nome" value="${esc(estado.escola)}" maxlength="120" required ${admin?'':'disabled'}></label><button class="botao primaria" ${admin?'':'disabled'}>Salvar alteração</button></form><p>${admin?'Somente o administrador pode alterar o nome.':'Apenas administradores podem modificar as configurações.'}</p></div>`;
  if(admin)selecionar('#form-escola').onsubmit=async e=>{e.preventDefault();try{let r=await api('/api/escola',{method:'PUT',body:JSON.stringify({nome:new FormData(e.target).get('nome')})});estado.escola=r.escola;selecionar('#escola-nome').textContent=r.escola;alerta('Escola atualizada.');}catch(err){alerta(err.message)}};
}
selecionar('#form-acesso').onsubmit=async e=>{
  e.preventDefault();selecionar('#acesso-erro').textContent='';selecionar('#acesso-enviar').disabled=true;
  try{const d=Object.fromEntries(new FormData(e.target));entrarApp(await api('/api/'+e.target.dataset.modo,{method:'POST',body:JSON.stringify(d)}));}
  catch(err){selecionar('#acesso-erro').textContent=err.message;}finally{selecionar('#acesso-enviar').disabled=false;}
};
selecionar('#mostrar-senha').onchange=e=>selecionar('#senha').type=e.target.checked?'text':'password';
selecionar('#form-cadastro').onsubmit=async e=>{
  e.preventDefault();const p=e.target.dataset.pagina;const d=Object.fromEntries(new FormData(e.target));
  if(p==='frequencias')d.presente=d.presente==='true';
  try{await api('/api/'+p,{method:'POST',body:JSON.stringify(d)});selecionar('#modal').close();alerta('Cadastro salvo somente na sua escola.');navegar(p);}
  catch(err){selecionar('#modal-erro').textContent=err.message;}
};
selecionar('#fechar-modal').onclick=()=>selecionar('#modal').close();selecionar('#cancelar-modal').onclick=()=>selecionar('#modal').close();
selecionar('#sair').onclick=async()=>{try{await api('/api/sair',{method:'POST'});}catch{}estado={usuario:null,escola:'',pagina:'dashboard',alunos:[],turmas:[]};selecionar('#form-acesso').reset();history.replaceState(null,'',destino('/entrar'));entrarTela(false);};
selecionar('#abrir-menu').onclick=()=>{selecionar('#menu-lateral').classList.add('aberto');selecionar('#sombra-menu').classList.add('aberto');selecionar('#abrir-menu').setAttribute('aria-expanded','true');selecionar('#fechar-menu-lateral').focus();};
selecionar('#fechar-menu-lateral').onclick=fecharMenu;
selecionar('#sombra-menu').onclick=fecharMenu;
selecionar('#abrir-avisos').onclick=()=>navegar('avisos');
selecionar('#abrir-perfil').onclick=()=>navegar('configuracoes');
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&selecionar('#menu-lateral').classList.contains('aberto'))fecharMenu();});
(async function iniciar(){try{if((location.pathname==='/cadastrar'||(emDemo&&new URLSearchParams(location.search).get('acao')==='cadastrar')))return entrarTela(true);try{entrarApp(await api('/api/me'));}catch{entrarTela(false);}}catch{entrarTela(false);selecionar('#acesso-erro').textContent='Servidor indisponível. Execute python servidor.py no terminal.';}})();
