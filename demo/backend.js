(function demoBackend(){
  'use strict';
  // Simulador didático para GitHub Pages: não é autenticação de servidor.
  window.BASE_DEMO = true;
  const CHAVE = 'base-demo-dados-v2';
  const SESSAO = 'base-demo-sessao-v2';
  const TABELAS = ['alunos','professores','turmas','frequencias','avisos'];
  const CAMPOS = {alunos:['nome','matricula','turma'],professores:['nome','disciplina','email'],turmas:['nome','ano','turno'],frequencias:['alunoId','data','presente'],avisos:['titulo','mensagem']};
  const originalFetch = window.fetch.bind(window);
  const inicial = () => ({escola:'',usuarios:[],alunos:[],professores:[],turmas:[],frequencias:[],avisos:[]});
  function banco(){
    try {
      const guardado = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if(!guardado || !Array.isArray(guardado.usuarios) || !TABELAS.every(t=>Array.isArray(guardado[t]))) return inicial();
      return guardado;
    } catch {return inicial();}
  }
  const salvar = b=>localStorage.setItem(CHAVE,JSON.stringify(b));
  function erro(status,mensagem){const e=new Error(mensagem);e.status=status;throw e;}
  function campo(valor,nome,min=1,max=150){
    if(typeof valor !== 'string' || valor.trim().length<min || valor.trim().length>max) erro(400,'Preencha '+nome+' corretamente.');
    return valor.trim();
  }
  function matricula(valor){const s=campo(valor,'matrícula',3,24).toUpperCase();if(!/^[A-Z0-9._-]+$/.test(s))erro(400,'Matrícula inválida.');return s;}
  function senha(valor){if(typeof valor!=='string'||valor.length<8||valor.length>100)erro(400,'A senha precisa ter 8 a 100 caracteres.');return valor;}
  function hex(bytes){return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
  async function hash(credencial,sal){
    const chave = await crypto.subtle.importKey('raw',new TextEncoder().encode(credencial),'PBKDF2',false,['deriveBits']);
    const bits = await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(sal),iterations:120000},chave,256);
    return hex(new Uint8Array(bits));
  }
  const publico = u=>({id:u.id,nome:u.nome,matricula:u.matricula,perfil:u.perfil});
  const retorno=(status,dados)=>new Response(JSON.stringify(dados),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  async function processar(rota,metodo,dados){
    const b=banco();
    if(rota==='/api/inicio'&&metodo==='GET')return [200,{configurado:b.usuarios.length>0}];
    if(rota==='/api/configurar'&&metodo==='POST'){
      if(b.usuarios.length)erro(403,'O administrador já está cadastrado neste navegador.');
      const escola=campo(dados.escola,'nome da escola',2),nome=campo(dados.nome,'nome',2),mat=matricula(dados.matricula),pass=senha(dados.senha);
      const sal=hex(crypto.getRandomValues(new Uint8Array(16)));
      const u={id:crypto.randomUUID(),nome,matricula:mat,perfil:'Administrador',sal,hash:await hash(pass,sal)};
      b.escola=escola;b.usuarios.push(u);salvar(b);sessionStorage.setItem(SESSAO,u.id);
      return [201,{usuario:publico(u),escola}];
    }
    if(rota==='/api/login'&&metodo==='POST'){
      const u=b.usuarios.find(x=>x.matricula===String(dados.matricula||'').trim().toUpperCase());
      if(!u||typeof dados.senha!=='string'||await hash(dados.senha,u.sal)!==u.hash) erro(401,'Matrícula ou senha incorretas.');
      sessionStorage.setItem(SESSAO,u.id);
      return [200,{usuario:publico(u),escola:b.escola}];
    }
    const u=b.usuarios.find(x=>x.id===sessionStorage.getItem(SESSAO));
    if(!u)erro(401,'Faça login com uma conta cadastrada neste navegador.');
    if(rota==='/api/me'&&metodo==='GET')return [200,{usuario:publico(u),escola:b.escola}];
    if(rota==='/api/sair'&&metodo==='POST'){sessionStorage.removeItem(SESSAO);return [200,{ok:true}];}
    if(rota==='/api/resumo'&&metodo==='GET'){
      const total=b.frequencias.length;
      const atividades=TABELAS.flatMap(t=>b[t].map(i=>({tipo:t,criadoEm:i.criadoEm,titulo:i.nome||i.titulo||i.data||'Registro'}))).sort((a,c)=>c.criadoEm.localeCompare(a.criadoEm)).slice(0,5);
      return [200,{alunos:b.alunos.length,professores:b.professores.length,turmas:b.turmas.length,frequencia:total?Math.round(b.frequencias.filter(f=>f.presente).length/total*100):null,avisos:b.avisos.slice(-4).reverse(),atividades}];
    }
    if(rota==='/api/usuarios'){
      if(u.perfil!=='Administrador')erro(403,'Apenas administradores cadastram usuários.');
      if(metodo==='GET')return [200,b.usuarios.map(publico)];
      if(metodo==='POST'){
        const mat=matricula(dados.matricula);
        if(b.usuarios.some(x=>x.matricula===mat))erro(409,'Matrícula já cadastrada.');
        const nome=campo(dados.nome,'nome',2),pass=senha(dados.senha),sal=hex(crypto.getRandomValues(new Uint8Array(16)));
        const novo={id:crypto.randomUUID(),nome,matricula:mat,perfil:'Funcionário',sal,hash:await hash(pass,sal)};
        b.usuarios.push(novo);salvar(b);return [201,publico(novo)];
      }
    }
    const partes=rota.split('/').filter(Boolean);
    if(partes[0]==='api'&&TABELAS.includes(partes[1])){
      const t=partes[1];
      if(partes.length===2&&metodo==='GET')return [200,b[t].slice().reverse()];
      if(partes.length===2&&metodo==='POST'){
        const item={id:crypto.randomUUID(),criadoEm:new Date().toISOString()};
        for(const c of CAMPOS[t]){
          if(c==='presente'){if(typeof dados[c]!=='boolean')erro(400,'Presença inválida.');item[c]=dados[c];}
          else item[c]=campo(dados[c],c,1,c==='mensagem'?400:150);
        }
        if(t==='alunos'&&b.alunos.some(a=>a.matricula===item.matricula))erro(409,'Matrícula já cadastrada.');
        if(t==='frequencias'){
          if(!b.alunos.some(a=>a.id===item.alunoId))erro(400,'Aluno não encontrado.');
          if(!/^\d{4}-\d{2}-\d{2}$/.test(item.data))erro(400,'Data inválida.');
          if(b.frequencias.some(f=>f.alunoId===item.alunoId&&f.data===item.data))erro(409,'Frequência já registrada.');
        }
        b[t].push(item);salvar(b);return [201,item];
      }
      if(partes.length===3&&metodo==='DELETE'){
        const i=b[t].findIndex(x=>x.id===partes[2]);
        if(i<0)erro(404,'Registro não encontrado.');
        if(t==='alunos'&&b.frequencias.some(f=>f.alunoId===partes[2]))erro(409,'Exclua primeiro as frequências deste aluno.');
        b[t].splice(i,1);salvar(b);return [200,{ok:true}];
      }
    }
    erro(404,'Recurso não encontrado.');
  }
  window.fetch=async function(entrada,opcoes={}){
    const url=new URL(typeof entrada==='string'?entrada:entrada.url,location.href);
    if(!url.pathname.startsWith('/api/'))return originalFetch(entrada,opcoes);
    try{
      const metodo=String(opcoes.method||'GET').toUpperCase();
      const dados=opcoes.body?JSON.parse(opcoes.body):{};
      const [status,payload]=await processar(url.pathname,metodo,dados);
      return retorno(status,payload);
    }catch(e){return retorno(e.status||500,{erro:e.status?e.message:'Falha ao acessar os dados de demonstração.'});}
  };
})();
