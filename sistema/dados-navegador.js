(function demoCode(){
  "use strict";
  if (!window.BASE_STATIC_DEMO) return;
  const DBKEY="base-school-pages-v4",SESS="base-school-session-v4";
  const TYPES={alunos:["nome","matricula","turma"],matriculas:["alunoId","turmaId","data"],turmas:["nome","ano","turno"],professores:["nome","disciplina","email"],frequencias:["alunoId","data","presente"],avaliacoes:["alunoId","disciplina","nota","data"],conteudos:["titulo","disciplina","descricao","data"],avisos:["titulo","mensagem"]};
  const originalFetch=window.fetch.bind(window);
  const novo=()=>({
    escolas:[{id:"base-academico",nome:"B.A.S.E. — Ambiente Acadêmico"}],
    usuarios:[{id:"base-admin",escolaId:"base-academico",nome:"Administrador B.A.S.E.",matricula:"202613078",salt:"9c2b17ac7f40295ea18647b05f8d3cc0",hash:"3f801ddf0d810a5a1833cf32e541b980793d7402c567a3dbc3ae23c34e306a23",perfil:"Administrador"}],
    dados:{"base-academico":escolaVazia()}
  });
  const escolaVazia=()=>Object.fromEntries(Object.keys(TYPES).map(x=>[x,[]]));
  const read=()=>{
    let a;
    try{a=JSON.parse(localStorage.getItem(DBKEY)||"null");}catch(e){}
    if(!a||!Array.isArray(a.escolas)||!Array.isArray(a.usuarios)||!a.dados)a=novo();
    if(!a.usuarios.some(u=>u.matricula==="202613078")){
      const inicial=novo();
      a.escolas.push(inicial.escolas[0]);
      a.usuarios.push(inicial.usuarios[0]);
      a.dados["base-academico"]=escolaVazia();
      localStorage.setItem(DBKEY,JSON.stringify(a));
    }
    return a;
  };
  const write=a=>localStorage.setItem(DBKEY,JSON.stringify(a));
  const uuid=()=>crypto.randomUUID();
  const err=(s,msg)=>{const e=new Error(msg);e.status=s;throw e;};
  const str=(s,c,min=1,max=150)=>{if(typeof s!=="string"||s.trim().length<min||s.trim().length>max)err(400,"Preencha "+c+" corretamente.");return s.trim();};
  const matricula=s=>{const v=str(s,"matrícula",3,32).toUpperCase();if(!/^[A-Z0-9._-]+$/.test(v))err(400,"Matrícula inválida.");return v;};
  const senha=s=>{if(typeof s!=="string"||s.length<8||s.length>100)err(400,"Senha de 8 a 100 caracteres.");return s;};
  const hex=arr=>Array.from(arr,x=>x.toString(16).padStart(2,"0")).join("");
  async function hash(password,salt){const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);return hex(new Uint8Array(await crypto.subtle.deriveBits({name:"PBKDF2",salt:new TextEncoder().encode(salt),iterations:160000,hash:"SHA-256"},key,256)));}
  const ficha=u=>({id:u.id,nome:u.nome,matricula:u.matricula,perfil:u.perfil});
  const resp=(status,data)=>new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8"}});
  async function request(path,method,data){
    const db=read();
    if(path==="/api/inicio"&&method==="GET")return [200,{configurado:!!db.escolas.length}];
    if(path==="/api/cadastrar"&&method==="POST"){
      const nomeEscola=str(data.escola,"escola",2,120),nome=str(data.nome,"administrador",2),mat=matricula(data.matricula),pass=senha(data.senha);
      if(db.usuarios.some(x=>x.matricula===mat))err(409,"Matrícula já cadastrada.");
      const id=uuid(),salt=hex(crypto.getRandomValues(new Uint8Array(16))),u={id:uuid(),escolaId:id,nome,matricula:mat,hash:await hash(pass,salt),salt,perfil:"Administrador"};
      db.escolas.push({id,nome:nomeEscola});db.usuarios.push(u);db.dados[id]=escolaVazia();write(db);sessionStorage.setItem(SESS,u.id);
      return [201,{usuario:ficha(u),escola:nomeEscola}];
    }
    if(path==="/api/login"&&method==="POST"){
      const login=String(data.matricula||"").trim().toUpperCase(),u=db.usuarios.find(x=>x.matricula===login);
      if(!u||typeof data.senha!=="string"||await hash(data.senha,u.salt)!==u.hash)err(401,"Matrícula ou senha incorretas.");
      sessionStorage.setItem(SESS,u.id);return [200,{usuario:ficha(u),escola:db.escolas.find(e=>e.id===u.escolaId).nome}];
    }
    const u=db.usuarios.find(x=>x.id===sessionStorage.getItem(SESS));
    if(!u)err(401,"Entre com sua matrícula e senha.");
    const escola=db.escolas.find(e=>e.id===u.escolaId),d=db.dados[u.escolaId];
    if(!escola||!d)err(401,"Escola indisponível.");
    if(path==="/api/me"&&method==="GET")return [200,{usuario:ficha(u),escola:escola.nome}];
    if(path==="/api/sair"&&method==="POST"){sessionStorage.removeItem(SESS);return [200,{ok:true}];}
    if(path==="/api/escola"&&method==="PUT"){
      if(u.perfil!=="Administrador")err(403,"Apenas o administrador pode alterar a escola.");
      escola.nome=str(data.nome,"nome da escola",2,120);write(db);return [200,{escola:escola.nome}];
    }
    if(path==="/api/resumo"&&method==="GET"){
      const f=d.frequencias,atividades=Object.keys(TYPES).flatMap(t=>d[t].map(a=>({tipo:t,criadoEm:a.criadoEm,titulo:a.nome||a.titulo||a.data||"Registro"}))).sort((a,b)=>b.criadoEm.localeCompare(a.criadoEm)).slice(0,5);
      return [200,{alunos:d.alunos.length,turmas:d.turmas.length,professores:d.professores.length,frequencia:f.length?Math.round(f.filter(x=>x.presente).length*100/f.length):null,avisos:d.avisos.slice(-4).reverse(),atividades}];
    }
    if(path==="/api/usuarios"){
      if(u.perfil!=="Administrador")err(403,"Somente administradores podem cadastrar usuários.");
      if(method==="GET")return [200,db.usuarios.filter(x=>x.escolaId===u.escolaId).map(ficha)];
      if(method==="POST"){
        const mat=matricula(data.matricula);
        if(db.usuarios.some(x=>x.matricula===mat))err(409,"Matrícula já cadastrada.");
        const nome=str(data.nome,"nome",2),salt=hex(crypto.getRandomValues(new Uint8Array(16))),pass=senha(data.senha),novo={id:uuid(),escolaId:u.escolaId,nome,matricula:mat,salt,hash:await hash(pass,salt),perfil:"Funcionário"};
        db.usuarios.push(novo);write(db);return [201,ficha(novo)];
      }
    }
    const parts=path.split("/").filter(Boolean),t=parts[1];
    if(parts[0]==="api"&&Object.prototype.hasOwnProperty.call(TYPES,t)){
      const itens=d[t];
      if(parts.length===2&&method==="GET")return [200,itens.slice().reverse()];
      if(parts.length===2&&method==="POST"){
        const a={};
        for(const c of TYPES[t]){
          if(c==="presente"){if(typeof data[c]!=="boolean")err(400,"Presença inválida.");a[c]=data[c];}
          else if(c==="nota"){const n=Number(data[c]);if(!Number.isFinite(n)||n<0||n>10)err(400,"Nota de 0 a 10.");a[c]=n;}
          else a[c]=str(data[c],c,1,400);
        }
        if(["frequencias","avaliacoes","matriculas"].includes(t)&&!d.alunos.some(x=>x.id===a.alunoId))err(400,"Aluno não pertence a esta escola.");
        if(t==="matriculas"&&!d.turmas.some(x=>x.id===a.turmaId))err(400,"Turma não pertence a esta escola.");
        if(["frequencias","avaliacoes","matriculas","conteudos"].includes(t)&&!/^\d{4}-\d{2}-\d{2}$/.test(a.data))err(400,"Data inválida.");
        if(t==="alunos"&&itens.some(x=>x.matricula===a.matricula))err(409,"Matrícula de aluno já cadastrada.");
        if(t==="matriculas"&&itens.some(x=>x.alunoId===a.alunoId&&x.turmaId===a.turmaId))err(409,"Matrícula já existente.");
        if(t==="frequencias"&&itens.some(x=>x.alunoId===a.alunoId&&x.data===a.data))err(409,"Frequência já registrada.");
        Object.assign(a,{id:uuid(),criadoEm:new Date().toISOString()});itens.push(a);write(db);return [201,a];
      }
      if(parts.length===3&&method==="DELETE"){
        const idx=itens.findIndex(x=>x.id===parts[2]);if(idx<0)err(404,"Registro não encontrado nesta escola.");
        if(t==="alunos"&&["frequencias","avaliacoes","matriculas"].some(k=>d[k].some(x=>x.alunoId===parts[2])))err(409,"Remova primeiro os registros do aluno.");
        if(t==="turmas"&&d.matriculas.some(x=>x.turmaId===parts[2]))err(409,"Remova primeiro as matrículas da turma.");
        itens.splice(idx,1);write(db);return [200,{ok:true}];
      }
    }
    err(404,"Recurso não encontrado.");
  }
  window.fetch=async function(resource,opts={}){
    const u=new URL(typeof resource==="string"?resource:resource.url,location.href);
    if(!u.pathname.startsWith("/api/"))return originalFetch(resource,opts);
    try{const body=opts.body?JSON.parse(opts.body):{},[status,data]=await request(u.pathname,String(opts.method||"GET").toUpperCase(),body);return resp(status,data);}
    catch(e){return resp(e.status||500,{erro:e.status?e.message:"Erro na demonstração."});}
  };
})();
