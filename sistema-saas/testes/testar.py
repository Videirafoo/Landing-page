from pathlib import Path
from urllib.request import Request, build_opener, HTTPCookieProcessor, HTTPRedirectHandler
from urllib.error import HTTPError
from http.cookiejar import CookieJar
from tempfile import TemporaryDirectory
import shutil, json, subprocess, os, time, urllib.parse
SRC=Path(__file__).resolve().parents[1]
class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self,req,fp,code,msg,headers,newurl): return None
class Client:
    def __init__(self): self.open=build_opener(HTTPCookieProcessor(CookieJar()),NoRedirect())
    def call(self, path, body=None, method=None):
        data=json.dumps(body).encode() if body is not None else None
        req=Request('http://127.0.0.1:3189'+path,data=data,method=method,headers={'Content-Type':'application/json'})
        try:
            res=self.open.open(req, timeout=4);status=res.status;raw=res.read();headers=res.headers
        except HTTPError as e: status=e.code;raw=e.read();headers=e.headers
        return status,json.loads(raw) if raw and headers.get_content_type()=='application/json' else raw
with TemporaryDirectory() as tmp:
    q=Path(tmp);shutil.copytree(SRC/'public',q/'public');shutil.copy(SRC/'servidor.py',q/'servidor.py');(q/'dados').mkdir()
    proc=subprocess.Popen(['python',str(q/'servidor.py')],env={**os.environ,'PORT':'3189'},stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    try:
        for _ in range(30):
            try:
                c=Client();assert c.call('/api/inicio')[0]==200;break
            except Exception: time.sleep(0.12)
        else: raise AssertionError('Servidor não iniciou')
        a,b,anon=Client(),Client(),Client()
        assert anon.call('/painel')[0]==302
        assert anon.call('/api/resumo')[0]==401
        assert anon.call('/api/login',{'matricula':'NAOEXISTE','senha':'x'})[0]==401
        x,ra=a.call('/api/cadastrar',{'escola':'Escola Municipal A','nome':'Administrador A','matricula':'ADM_A','senha':'SenhaForte!123'})
        assert x==201,(x,ra)
        assert a.call('/api/me')[0]==200
        assert a.call('/api/resumo')[1]['alunos']==0
        assert b.call('/api/login',{'matricula':'ADM_A','senha':'senha-errada'})[0]==401
        x,rb=b.call('/api/cadastrar',{'escola':'Escola Particular B','nome':'Administrador B','matricula':'ADM_B','senha':'Seguranca!456'})
        assert x==201,(x,rb)
        xa,aluno=a.call('/api/alunos',{'nome':'Estudante da Escola A','matricula':'A001','turma':'6º A'})
        assert xa==201,aluno
        xt,turma=a.call('/api/turmas',{'nome':'6º A','ano':'6º ano','turno':'Manhã'});assert xt==201
        assert a.call('/api/avaliacoes',{'alunoId':aluno['id'],'disciplina':'Matemática','nota':9.5,'data':'2026-11-09'})[0]==201
        assert a.call('/api/frequencias',{'alunoId':aluno['id'],'data':'2026-11-09','presente':True})[0]==201
        assert a.call('/api/matriculas',{'alunoId':aluno['id'],'turmaId':turma['id'],'data':'2026-11-09'})[0]==201
        assert a.call('/api/professores',{'nome':'Professor A','disciplina':'Matemática','email':'prof@example.org'})[0]==201
        assert a.call('/api/avisos',{'titulo':'Reunião','mensagem':'Reunião escolar'})[0]==201
        assert a.call('/api/conteudos',{'titulo':'Equações','disciplina':'Matemática','descricao':'Introdução','data':'2026-11-09'})[0]==201
        assert a.call('/api/resumo')[1]['alunos']==1
        assert a.call('/api/resumo')[1]['frequencia']==100
        assert len(b.call('/api/alunos')[1])==0
        assert b.call('/api/avaliacoes',{'alunoId':aluno['id'],'disciplina':'Português','nota':5,'data':'2026-11-09'})[0]==400
        assert b.call('/api/matriculas',{'alunoId':aluno['id'],'turmaId':turma['id'],'data':'2026-11-09'})[0]==400
        assert b.call('/api/alunos/'+aluno['id'],method='DELETE')[0]==404
        assert b.call('/api/escola',{'nome':'Escola B editada'},method='PUT')[0]==200
        assert b.call('/api/me')[1]['escola']=='Escola B editada'
        assert b.call('/api/usuarios',{'nome':'Operador B','matricula':'OP_B','senha':'Senha-9876'})[0]==201
        assert b.call('/api/usuarios',{'nome':'Operador A','matricula':'ADM_A','senha':'Senha-9876'})[0]==409
        assert a.call('/api/usuarios')[1][0]['matricula']=='ADM_A'
        assert b.call('/api/usuarios')[1][0]['matricula']=='ADM_B'
        assert a.call('/api/sair',{},method='POST')[0]==200
        assert a.call('/api/resumo')[0]==401
        assert a.call('/painel')[0]==302
        assert a.call('/api/login',{'matricula':'ADM_A','senha':'Errada-Mas-Valida!123'})[0]==401
        assert a.call('/api/login',{'matricula':'ADM_A','senha':'SenhaForte!123'})[0]==200
        db=json.loads((q/'dados'/'banco.txt').read_text())
        assert len(db['escolas'])==2
        assert 'SenhaForte!123' not in (q/'dados'/'banco.txt').read_text()
        assert len(db['dados'])==2
        print('TESTES OK: login, senha errada, acesso privado, duas escolas isoladas, CRUD, indicadores, sessão, alteração da escola, banco TXT e senha em hash.')
    finally:
        proc.terminate();proc.wait(timeout=4)
