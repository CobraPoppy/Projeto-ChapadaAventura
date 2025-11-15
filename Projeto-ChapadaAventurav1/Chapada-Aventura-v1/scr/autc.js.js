document.getElementById('registerForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const email = document.getElementById('regEmail').value;
    const pass = document.getElementById('regPassword').value;
    const pass2 = document.getElementById('regPassword2').value;
    const terms = document.getElementById('terms').checked;

    if(pass !== pass2){
        alert("As senhas não conferem!");
        return;
    }

    if(!terms){
        alert("Você deve aceitar os direitos e termos do site.");
        return;
    }

    const data = { email, password: pass };

    // POST — Substitua pela URL da sua API
    await fetch("https://suaapi.com/cadastro", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(data)
    });

    const notify = document.getElementById("notify");
    notify.classList.remove("hidden");

    setTimeout(()=> notify.classList.add("hidden"), 3500);
});

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async (e)=>{
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const pass = document.getElementById('loginPassword').value;

    const data = { email, password: pass };

    await fetch("https://suaapi.com/login", {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body:JSON.stringify(data)
    });

    alert("Login realizado!");
});
