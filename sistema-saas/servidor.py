import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse
from uuid import uuid4

RAIZ = Path(__file__).resolve().parent
BANCO = RAIZ / 'dados' / 'banco.txt'
PUBLICO = RAIZ / 'public'
PORTA = int(os.environ.get('PORT', '3000'))
TRAVA = threading.RLock()
SESSOES = {}
FALHAS = {}
CONTA_PADRAO = {
    'id': 'base-admin',
    'escolaId': 'base-academico',
    'nome': 'Administrador B.A.S.E.',
    'matricula': '202613078',
    'hash': '5b2e6f88ac9e10d40495cc07bb3dc791:07bee5271cb3088e95f5a4475f3d7fbd7ca845f7d9e9e86fd54f89163b4945c0',
    'perfil': 'Administrador'
}
CAMPOS = {
    'alunos': ['nome', 'matricula', 'turma'],
    'matriculas': ['alunoId', 'turmaId', 'data'],
    'turmas': ['nome', 'ano', 'turno'],
    'professores': ['nome', 'disciplina', 'email'],
    'frequencias': ['alunoId', 'data', 'presente'],
    'avaliacoes': ['alunoId', 'disciplina', 'nota', 'data'],
    'conteudos': ['titulo', 'disciplina', 'descricao', 'data'],
    'avisos': ['titulo', 'mensagem'],
}

class ApiErro(Exception):
    def __init__(self, status, mensagem):
        super().__init__(mensagem)
        self.status = status


def agora():
    return datetime.now(timezone.utc).isoformat()


def ler():
    return json.loads(BANCO.read_text(encoding='utf-8'))


def salvar(banco):
    temporario = BANCO.with_suffix('.tmp')
    temporario.write_text(json.dumps(banco, ensure_ascii=False, indent=2), encoding='utf-8')
    os.replace(temporario, BANCO)


def exigir(valor, campo, minimo=1, maximo=150):
    if not isinstance(valor, str) or not minimo <= len(valor.strip()) <= maximo:
        raise ApiErro(400, f'Preencha {campo} corretamente.')
    return valor.strip()


def matricula(valor):
    login = exigir(valor, 'matrícula de acesso', 3, 32).upper()
    if not re.fullmatch(r'[A-Z0-9._-]+', login):
        raise ApiErro(400, 'Matrícula inválida: use letras, números, ponto, hífen ou underline.')
    return login


def senha_valida(senha):
    if not isinstance(senha, str) or not 8 <= len(senha) <= 100:
        raise ApiErro(400, 'A senha deve ter de 8 a 100 caracteres.')
    return senha


def criar_hash(senha):
    sal = secrets.token_bytes(16)
    chave = hashlib.scrypt(senha.encode(), salt=sal, n=2**14, r=8, p=1, dklen=32)
    return sal.hex() + ':' + chave.hex()


def conferir(senha, salvo):
    try:
        sal, chave = salvo.split(':')
        esperado = hashlib.scrypt(senha.encode(), salt=bytes.fromhex(sal), n=2**14, r=8, p=1, dklen=32)
        return hmac.compare_digest(esperado, bytes.fromhex(chave))
    except (AttributeError, ValueError, TypeError):
        return False


def ficha(usuario):
    return {k: usuario[k] for k in ('id', 'nome', 'matricula', 'perfil')}


def padrao_escola():
    return {t: [] for t in CAMPOS}


def isodata(texto):
    try:
        return bool(re.fullmatch(r'\d{4}-\d{2}-\d{2}', texto)) and datetime.strptime(texto, '%Y-%m-%d').strftime('%Y-%m-%d') == texto
    except (ValueError, TypeError):
        return False


class Servidor(BaseHTTPRequestHandler):
    server_version = 'BASE/1.0'
    sys_version = ''

    def enviar(self, codigo, objeto, cookie=None):
        conteudo = json.dumps(objeto, ensure_ascii=False).encode('utf-8')
        self.send_response(codigo)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if cookie:
            self.send_header('Set-Cookie', cookie)
        self.send_header('Content-Length', str(len(conteudo)))
        self.end_headers()
        self.wfile.write(conteudo)

    def corpo(self):
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if n < 0 or n > 20000:
                raise ApiErro(413, 'Cadastro muito grande.')
            data = json.loads(self.rfile.read(n) or b'{}')
            if not isinstance(data, dict):
                raise ValueError()
            return data
        except (ValueError, UnicodeError):
            raise ApiErro(400, 'Dados JSON inválidos.')

    def token(self):
        for parte in self.headers.get('Cookie', '').split(';'):
            if parte.strip().startswith('base_sessao='):
                return parte.strip().split('=', 1)[1]
        return ''

    def usuario(self, banco):
        sessao = SESSOES.get(self.token())
        if not sessao or sessao['expira'] < time.time():
            raise ApiErro(401, 'Entre com sua matrícula e senha.')
        usuario = next((u for u in banco['usuarios'] if u['id'] == sessao['usuarioId']), None)
        if not usuario:
            raise ApiErro(401, 'Usuário não autorizado.')
        return usuario

    def logar(self, usuario):
        token = secrets.token_urlsafe(32)
        SESSOES[token] = {'usuarioId': usuario['id'], 'expira': time.time() + 8 * 3600}
        cookie = f'base_sessao={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800'
        if os.environ.get('BASE_HTTPS') == '1':
            cookie += '; Secure'
        return cookie

    def origem(self):
        origem = self.headers.get('Origin')
        if origem:
            esperado = f'http://{self.headers.get("Host", "")}'
            if origem != esperado and not (os.environ.get('BASE_HTTPS') == '1' and origem == esperado.replace('http:', 'https:')):
                raise ApiErro(403, 'Origem não autorizada.')

    def executar(self, metodo):
        url = urlparse(self.path).path
        if url.startswith('/api/'):
            try:
                if metodo != 'GET':
                    self.origem()
                with TRAVA:
                    self.api(url, metodo)
            except ApiErro as erro:
                self.enviar(erro.status, {'erro': str(erro)})
            except Exception:
                self.enviar(500, {'erro': 'Erro interno do servidor.'})
        elif metodo == 'GET':
            self.estatico(url)
        else:
            self.send_error(405)

    def do_GET(self): self.executar('GET')
    def do_POST(self): self.executar('POST')
    def do_DELETE(self): self.executar('DELETE')
    def do_PUT(self): self.executar('PUT')

    def api(self, rota, metodo):
        banco = ler()
        if rota == '/api/inicio' and metodo == 'GET':
            return self.enviar(200, {'configurado': bool(banco['escolas'])})

        if rota in ('/api/configurar', '/api/cadastrar') and metodo == 'POST':
            dados = self.corpo()
            nome_escola = exigir(dados.get('escola'), 'nome da escola', 2, 120)
            nome = exigir(dados.get('nome'), 'nome do administrador', 2)
            login = matricula(dados.get('matricula'))
            senha = senha_valida(dados.get('senha'))
            if any(u['matricula'] == login for u in banco['usuarios']):
                raise ApiErro(409, 'Essa matrícula de acesso já está em uso. Escolha outra.')
            escola = {'id': uuid4().hex, 'nome': nome_escola, 'criadoEm': agora()}
            usuario = {'id': uuid4().hex, 'escolaId': escola['id'], 'nome': nome,
                       'matricula': login, 'hash': criar_hash(senha), 'perfil': 'Administrador'}
            banco['escolas'].append(escola)
            banco['usuarios'].append(usuario)
            banco['dados'][escola['id']] = padrao_escola()
            salvar(banco)
            return self.enviar(201, {'usuario': ficha(usuario), 'escola': escola['nome']}, self.logar(usuario))

        if rota == '/api/login' and metodo == 'POST':
            dados = self.corpo()
            login = str(dados.get('matricula', '')).strip().upper()
            senha = dados.get('senha')
            chave = self.client_address[0] + ':' + login
            bloqueio = FALHAS.get(chave, {'contagem': 0, 'ate': 0})
            if bloqueio['ate'] > time.time():
                raise ApiErro(429, 'Muitas tentativas. Aguarde um minuto.')
            usuario = next((u for u in banco['usuarios'] if u['matricula'] == login), None)
            if not usuario or not isinstance(senha, str) or not conferir(senha, usuario['hash']):
                total = bloqueio['contagem'] + 1
                FALHAS[chave] = {'contagem': total, 'ate': time.time() + 60 if total >= 5 else 0}
                raise ApiErro(401, 'Matrícula ou senha incorretas.')
            FALHAS.pop(chave, None)
            escola = next(e for e in banco['escolas'] if e['id'] == usuario['escolaId'])
            return self.enviar(200, {'usuario': ficha(usuario), 'escola': escola['nome']}, self.logar(usuario))

        usuario = self.usuario(banco)
        escola = next((e for e in banco['escolas'] if e['id'] == usuario['escolaId']), None)
        if not escola:
            raise ApiErro(401, 'Escola indisponível.')
        dados_escola = banco['dados'][escola['id']]

        if rota == '/api/me' and metodo == 'GET':
            return self.enviar(200, {'usuario': ficha(usuario), 'escola': escola['nome']})
        if rota == '/api/sair' and metodo == 'POST':
            SESSOES.pop(self.token(), None)
            return self.enviar(200, {'ok': True}, 'base_sessao=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
        if rota == '/api/escola' and metodo == 'PUT':
            if usuario['perfil'] != 'Administrador':
                raise ApiErro(403, 'Somente o administrador pode alterar a escola.')
            nome = exigir(self.corpo().get('nome'), 'nome da escola', 2, 120)
            escola['nome'] = nome
            salvar(banco)
            return self.enviar(200, {'escola': nome})
        if rota == '/api/resumo' and metodo == 'GET':
            freq = dados_escola['frequencias']
            atividades = [{ 'tipo': t, 'criadoEm': x['criadoEm'], 'titulo': x.get('nome') or x.get('titulo') or x.get('data') or 'Registro'}
                          for t in CAMPOS for x in dados_escola[t]]
            atividades.sort(key=lambda x: x['criadoEm'], reverse=True)
            return self.enviar(200, {
                'alunos': len(dados_escola['alunos']), 'turmas': len(dados_escola['turmas']),
                'professores': len(dados_escola['professores']),
                'frequencia': round(100 * sum(bool(x['presente']) for x in freq) / len(freq)) if freq else None,
                'avisos': list(reversed(dados_escola['avisos'][-4:])), 'atividades': atividades[:5]
            })

        if rota == '/api/usuarios':
            if usuario['perfil'] != 'Administrador':
                raise ApiErro(403, 'Somente administradores podem cadastrar usuários.')
            if metodo == 'GET':
                return self.enviar(200, [ficha(u) for u in banco['usuarios'] if u['escolaId'] == escola['id']])
            if metodo == 'POST':
                d = self.corpo()
                login = matricula(d.get('matricula'))
                if any(u['matricula'] == login for u in banco['usuarios']):
                    raise ApiErro(409, 'Matrícula de acesso já cadastrada.')
                nome = exigir(d.get('nome'), 'nome', 2)
                novo = {'id': uuid4().hex, 'escolaId': escola['id'], 'nome': nome,
                        'matricula': login, 'hash': criar_hash(senha_valida(d.get('senha'))), 'perfil': 'Funcionário'}
                banco['usuarios'].append(novo)
                salvar(banco)
                return self.enviar(201, ficha(novo))

        pedacos = rota.split('/')
        if len(pedacos) >= 3 and pedacos[1] == 'api' and pedacos[2] in CAMPOS:
            tabela = pedacos[2]
            itens = dados_escola[tabela]
            if metodo == 'GET' and len(pedacos) == 3:
                return self.enviar(200, list(reversed(itens)))
            if metodo == 'POST' and len(pedacos) == 3:
                d = self.corpo()
                item = {}
                for c in CAMPOS[tabela]:
                    if c == 'presente':
                        if not isinstance(d.get(c), bool): raise ApiErro(400, 'Situação inválida.')
                        item[c] = d[c]
                    elif c == 'nota':
                        try:
                            valor = float(d.get(c))
                            if not 0 <= valor <= 10: raise ValueError()
                        except (ValueError, TypeError):
                            raise ApiErro(400, 'Nota entre 0 e 10.')
                        item[c] = valor
                    else:
                        item[c] = exigir(d.get(c), c, 1, 400 if c in ('descricao', 'mensagem') else 150)
                if tabela in ('frequencias', 'avaliacoes', 'matriculas'):
                    if not any(a['id'] == item['alunoId'] for a in dados_escola['alunos']):
                        raise ApiErro(400, 'Aluno não pertence à sua escola.')
                if tabela == 'matriculas' and not any(t['id'] == item['turmaId'] for t in dados_escola['turmas']):
                    raise ApiErro(400, 'Turma não pertence à sua escola.')
                if tabela in ('frequencias', 'avaliacoes', 'matriculas', 'conteudos') and not isodata(item['data']):
                    raise ApiErro(400, 'Data inválida.')
                if tabela == 'alunos' and any(a['matricula'] == item['matricula'] for a in itens):
                    raise ApiErro(409, 'Matrícula de aluno já cadastrada nesta escola.')
                if tabela == 'matriculas' and any(a['alunoId'] == item['alunoId'] and a['turmaId'] == item['turmaId'] for a in itens):
                    raise ApiErro(409, 'Matrícula já existente.')
                if tabela == 'frequencias' and any(a['alunoId'] == item['alunoId'] and a['data'] == item['data'] for a in itens):
                    raise ApiErro(409, 'Frequência já registrada.')
                item.update(id=uuid4().hex, criadoEm=agora())
                itens.append(item)
                salvar(banco)
                return self.enviar(201, item)
            if metodo == 'DELETE' and len(pedacos) == 4:
                id = pedacos[3]
                atual = next((i for i in itens if i['id'] == id), None)
                if not atual:
                    raise ApiErro(404, 'Registro não encontrado nesta escola.')
                if tabela == 'alunos' and any(f['alunoId'] == id for t in ('frequencias', 'avaliacoes', 'matriculas') for f in dados_escola[t]):
                    raise ApiErro(409, 'Remova primeiro os registros desse aluno.')
                if tabela == 'turmas' and any(m['turmaId'] == id for m in dados_escola['matriculas']):
                    raise ApiErro(409, 'Remova primeiro matrículas dessa turma.')
                itens.remove(atual)
                salvar(banco)
                return self.enviar(200, {'ok': True})

        raise ApiErro(404, 'Recurso não encontrado.')

    def estatico(self, rota):
        mapa = {
            '/': 'inicio.html', '/inicio.html': 'inicio.html',
            '/entrar': 'index.html', '/cadastrar': 'index.html', '/painel': 'index.html',
            '/index.html': 'inicio.html',
            '/style.css': 'style.css', '/app.js': 'app.js', '/inicio.css': 'inicio.css',
            '/logo-oficial.png': 'logo-oficial.png',
            '/assets/vazio-frequencia.svg': 'assets/vazio-frequencia.svg',
            '/assets/vazio-comunicados.svg': 'assets/vazio-comunicados.svg',
            '/assets/vazio-desempenho.svg': 'assets/vazio-desempenho.svg',
            '/assets/vazio-atividades.svg': 'assets/vazio-atividades.svg',
        }
        nome = rota.lstrip('/') if re.fullmatch(r'/assets/icones/[a-z]+\.svg', rota) else mapa.get(rota)
        if not nome:
            self.send_error(404, 'Página não encontrada')
            return
        if rota == '/painel':
            with TRAVA:
                try: self.usuario(ler())
                except ApiErro:
                    self.send_response(302)
                    self.send_header('Location', '/entrar')
                    self.send_header('Content-Length', '0')
                    self.end_headers()
                    return
        arq = PUBLICO / nome
        try:
            conteudo = arq.read_bytes()
        except FileNotFoundError:
            self.send_error(404, 'Arquivo não encontrado')
            return
        tipo = 'image/svg+xml' if nome.endswith('.svg') else 'image/png' if nome.endswith('.png') else 'text/html' if nome.endswith('.html') else 'text/css' if nome.endswith('.css') else 'text/javascript'
        self.send_response(200)
        self.send_header('Content-Type', tipo + '; charset=utf-8')
        self.send_header('Content-Length', str(len(conteudo)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(conteudo)


def iniciar():
    BANCO.parent.mkdir(parents=True, exist_ok=True)
    with TRAVA:
        banco = ler() if BANCO.exists() else {'escolas': [], 'usuarios': [], 'dados': {}}
        if not any(u['matricula'] == CONTA_PADRAO['matricula'] for u in banco['usuarios']):
            escola_id = CONTA_PADRAO['escolaId']
            if not any(e['id'] == escola_id for e in banco['escolas']):
                banco['escolas'].append({'id': escola_id, 'nome': 'B.A.S.E. — Ambiente Acadêmico', 'criadoEm': agora()})
            banco['usuarios'].append(CONTA_PADRAO.copy())
            banco['dados'].setdefault(escola_id, padrao_escola())
            salvar(banco)
        elif not BANCO.exists():
            salvar(banco)
    servidor = ThreadingHTTPServer(('127.0.0.1', PORTA), Servidor)
    print(f'B.A.S.E. multi-escola: http://127.0.0.1:{PORTA}')
    try: servidor.serve_forever()
    except KeyboardInterrupt: print('\nServidor encerrado.')
    finally: servidor.server_close()

if __name__ == '__main__':
    iniciar()
