const form = document.querySelector("#contact-form");
const statusText = document.querySelector("#form-status");
const countText = document.querySelector("#contact-count");
const STORAGE_KEY = "base_contatos";

function getContacts() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

function updateCount() {
  const total = getContacts().length;
  countText.textContent = total === 0
    ? "Nenhum contato registrado neste navegador."
    : `Contatos registrados neste navegador: ${total}`;
}

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const contact = {
    name: document.querySelector("#name").value.trim(),
    email: document.querySelector("#email").value.trim(),
    message: document.querySelector("#message").value.trim(),
    createdAt: new Date().toISOString()
  };

  const contacts = getContacts();
  contacts.push(contact);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));

  statusText.textContent = "Contato registrado com sucesso.";
  form.reset();
  updateCount();
});

updateCount();
const botaoMenu=document.querySelector(".nav-toggle");
const navegacao=document.querySelector(".main-nav");
if(botaoMenu&&navegacao){
  function fecharMenu(){
    navegacao.classList.remove("aberto");
    botaoMenu.setAttribute("aria-expanded","false");
  }
  botaoMenu.addEventListener("click",()=>{
    const aberto=navegacao.classList.toggle("aberto");
    botaoMenu.setAttribute("aria-expanded",String(aberto));
  });
  navegacao.querySelectorAll("a").forEach(link=>link.addEventListener("click",fecharMenu));
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape")fecharMenu();
  });
}
