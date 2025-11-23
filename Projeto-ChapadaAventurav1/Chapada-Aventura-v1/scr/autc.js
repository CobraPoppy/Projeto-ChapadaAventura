// ----------------------------
// PROTEÇÃO DE PÁGINA (SE FOR NECESSÁRIO)
// ----------------------------
if (window.location.pathname.includes("user.html") || window.location.pathname.includes("admin.html")) {
    const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuario) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "index.html";
    }
}


// ----------------------------
// CADASTRO
// ----------------------------
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const pass2 = document.getElementById('regPassword2').value;
    const terms = document.getElementById('terms').checked;

    if (pass !== pass2) {
        alert("As senhas não conferem!");
        return;
    }

    if (!terms) {
        alert("Você deve aceitar os termos do site.");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    if (usuarios.find(u => u.email === email)) {
        alert("Este e-mail já está cadastrado!");
        return;
    }

    usuarios.push({ email: email, senha: pass, tipo: "usuario" });
    localStorage.setItem("usuarios", JSON.stringify(usuarios));

    alert("Usuário cadastrado com sucesso!");
});


// ----------------------------
// LOGIN
// ----------------------------
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

    const usuario = usuarios.find(u => u.email === email && u.senha === pass);

    if (!usuario) {
        alert("Email ou senha incorretos!");
        return;
    }

    localStorage.setItem("usuarioLogado", JSON.stringify(usuario));

    alert("Login efetuado com sucesso!");

    // Redireciona
    if (usuario.tipo === "administrador") {
        window.location.href = "admin.html";
    } else {
        window.location.href = "user.html";
    }
});


// ----------------------------
// LOGOUT
// ----------------------------
function logout() {
    localStorage.removeItem("usuarioLogado");
    alert("Você saiu da sua conta!");
    window.location.href = "index.html";
}


// ----------------------------
// CLASSE ADMINISTRADORA
// ----------------------------
class Administradora {
    #usuarios;

    constructor() {
        this.#usuarios = [];
    }

    cadastrarUsuario(email, pass, tipo = "usuario") {
        if (this.#usuarios.some(u => u.email === email)) {
            return `Erro: O e-mail ${email} já está cadastrado.`;
        }

        const novoUsuario = { email, pass, tipo };
        this.#usuarios.push(novoUsuario);

        return `Usuário ${email} cadastrado como ${tipo}.`;
    }

    alterarUsuario(email, novosDados) {
        const usuario = this.#usuarios.find(u => u.email === email);

        if (!usuario) return `Usuário ${email} não encontrado.`;

        if (novosDados.email) usuario.email = novosDados.email;
        if (novosDados.pass) usuario.pass = novosDados.pass;
        if (novosDados.tipo) usuario.tipo = novosDados.tipo;

        return `Dados do usuário ${email} foram atualizados.`;
    }

    listarUsuarios() {
        return this.#usuarios;
    }
}
