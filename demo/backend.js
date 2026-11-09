// APENAS PARA DEMONSTRAÇÃO NO GITHUB PAGES.
// NÃO oferece autenticação real nem grava TXT. Use servidor.js no VS Code.
window.BASE_DEMO = true;
const K = 'base-visual-demo-v3';
const KS = 'base-visual-demo-session-v3';
const TAB = ['alunos','matriculas','turmas','professores','frequencias','avaliacoes','conteudos','avisos'];
const CAMPOS = {
  alunos:['nome','matricula','turma'],matriculas:['alunoId','turmaId','data'],turmas:['nome','ano','turno'],
  professores:['nome','disciplina','email'],frequencias:['alunoId','data','presente'],
  avaliacoes:['alunoId','disciplina','nota','data'],conteudos:['titulo','disciplina','descricao','data'],avisos:['titulo','mensagem']
};
function vazio(){return {escola:'',usuarios:[],...Object.fromEntries(TAB.map(t=>[t,[]]))};}
function ler(){try{const b=JSON.parse(localStorage.getItem(K));return b&&Array.isArray(b.usuarios)&&TAB.every(t=>Array.isArray(b[t]))?b:vazio();}catch{return vazio();}}
function gravar(b){localStorage.setItem(K,JSON.stringify(b));}
function erro(c,m){const e=Error(m);e.status=c;throw e;}
function campo(v,n,min=1){if(typeof v!=='string'||v.trim().length<min||v.length>400)erro(400,'Preencha '+n+' corretamente.');return v.trim();}
function matricula(v){const m=campo(v,'matrícula',3).toUpperCase();if(!/^[A-Z0-9._-]{3,24}$/.test(m))erro(400,'Matrícula inválida.');return m;}
function senha(v){if(typeof v!=='string'||v.length<8||v.length>100)erro(400,'Senha deve ter pelo menos 8 caracteres.');return v;}
function hex(bytes){return [...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');}
async function hash(s,sal){const chave=await crypto.subtle.importKey('raw',new TextEncoder().encode(s),'PBKDF2',false,['deriveBits']);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:new TextEncoder().encode(sal),iterations:120000},chave,256)));}
function publico(u){return {id:u.id,nome:u.nome,matricula:u.matricula,perfil:u.perfil};}
const fetchOriginal=window.fetch.bind(window);
window.fetch=async (input,options={})=>{
  const u=new URL(typeof input==='string'?input:input.url,location.href);
  if(!u.pathname.startsWith('/api/'))return fetchOriginal(input,options);
  const metodo=(options.method||'GET').toUpperCase();
  try{
    const b=ler();const dados=options.body?JSON.parse(options.body):{};let resp={};let status=200;
    if(u.pathname==='/api/inicio'&&metodo==='GET')resp={configurado:b.usuarios.length>0};
    else if(u.pathname==='/api/configurar'&&metodo==='POST'){
      if(b.usuarios.length)erro(403,'Administrador já cadastrado neste navegador.');
      b.escola=campo(dados.escola,'escola',2);const nome=campo(dados.nome,'nome',2),mat=matricula(dados.matricula),pass=senha(dados.senha);
      const sal=hex(crypto.getRandomValues(new Uint8Array(16))),novo={id:crypto.randomUUID(),nome,matricula:mat,perfil:'Administrador',sal,hash:await hash(pass,sal)};
      b.usuarios.push(novo);gravar(b);sessionStorage.setItem(KS,novo.id);resp={usuario:publico(novo),escola:b.escola};status=201;
    }else if(u.pathname==='/api/login'&&metodo==='POST'){
      const x=b.usuarios.find(a=>a.matricula===String(dados.matricula||'').trim().toUpperCase());
      if(!x||typeof dados.senha!=='string'||await hash(dados.senha,x.sal)!==x.hash)erro(401,'Matrícula ou senha incorretas.');
      sessionStorage.setItem(KS,x.id);resp={usuario:publico(x),escola:b.escola};
    }else{
      const user=b.usuarios.find(a=>a.id===sessionStorage.getItem(KS));
      if(!user)erro(401,'Faça login no seu navegador.');
      if(u.pathname==='/api/me')resp={usuario:publico(user),escola:b.escola};
      else if(u.pathname==='/api/sair'&&metodo==='POST'){sessionStorage.removeItem(KS);resp={ok:true};}
      else if(u.pathname==='/api/escola'&&metodo==='PUT'){
        if(user.perfil!=='Administrador')erro(403,'Somente administrador.');
        b.escola=campo(dados.nome,'nome da escola',2);gravar(b);resp={escola:b.escola};
      }else if(u.pathname==='/api/resumo'){
        const n=b.frequencias.length;
        resp={alunos:b.alunos.length,turmas:b.turmas.length,professores:b.professores.length,frequencia:n?Math.round(100*b.frequencias.filter(f=>f.presente).length/n):null,avisos:b.avisos.slice(-4).reverse(),atividades:TAB.flatMap(t=>b[t].map(a=>({tipo:t,titulo:a.nome||a.titulo||a.data||'Registro',criadoEm:a.criadoEm}))).sort((a,c)=>c.criadoEm.localeCompare(a.criadoEm)).slice(0,5)};
      }else if(u.pathname==='/api/usuarios'){
        if(user.perfil!=='Administrador')erro(403,'Somente administrador.');
        if(metodo==='GET')resp=b.usuarios.map(publico);
        else if(metodo==='POST'){
          const mat=matricula(dados.matricula);if(b.usuarios.some(x=>x.matricula===mat))erro(409,'Matrícula já cadastrada.');
          const sal=hex(crypto.getRandomValues(new Uint8Array(16))),novo={id:crypto.randomUUID(),nome:campo(dados.nome,'nome',2),matricula:mat,perfil:'Funcionário',sal,hash:await hash(senha(dados.senha),sal)};
          b.usuarios.push(novo);gravar(b);resp=publico(novo);status=201;
        }else erro(405,'Operação inválida.');
      }else{
        const parts=u.pathname.split('/').filter(Boolean),t=parts[1];
        if(parts[0]!=='api'||!TAB.includes(t))erro(404,'Recurso não encontrado.');
        if(parts.length===2&&metodo==='GET')resp=b[t].slice().reverse();
        else if(parts.length===2&&metodo==='POST'){
          const novo={id:crypto.randomUUID(),criadoEm:new Date().toISOString()};
          for(const f of CAMPOS[t]){if(f==='presente')novo[f]=dados[f]===true;else if(f==='nota'){novo[f]=Number(dados[f]);if(!Number.isFinite(novo[f])||novo[f]<0||novo[f]>10)erro(400,'Nota inválida.');}else novo[f]=campo(dados[f],f);}
          if(['frequencias','avaliacoes','matriculas'].includes(t)&&!b.alunos.some(a=>a.id===novo.alunoId))erro(400,'Aluno não encontrado.');
          if(t==='matriculas'&&!b.turmas.some(a=>a.id===novo.turmaId))erro(400,'Turma não encontrada.');
          if(t==='alunos'&&b.alunos.some(a=>a.matricula===novo.matricula))erro(409,'Matrícula já cadastrada.');
          b[t].push(novo);gravar(b);resp=novo;status=201;
        }else if(parts.length===3&&metodo==='DELETE'){
          const ix=b[t].findIndex(a=>a.id===parts[2]);if(ix<0)erro(404,'Registro não encontrado.');
          b[t].splice(ix,1);gravar(b);resp={ok:true};
        }else erro(405,'Operação inválida.');
      }
    }
    return new Response(JSON.stringify(resp),{status,headers:{'Content-Type':'application/json'}});
  }catch(e){return new Response(JSON.stringify({erro:e.message||'Falha na demonstração.'}),{status:e.status||500,headers:{'Content-Type':'application/json'}});}
};
