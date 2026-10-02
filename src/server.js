
const express = require("express");
app.use(express.json());
const fs = require("node:fs/promises");
const path = require("node:path");

const app = express();

const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

app.use(express.json());

app.use((req, res, next) => {
const inicio = Date.now();

res.on("finish", () => {
const tempo = Date.now() - inicio;
console.log(`${req.method} ${req.originalUrl} — ${tempo}ms`);
});

next();
});

async function lerEmprestimos() {
try {
const dados = await fs.readFile(DATA_FILE, "utf-8");
return JSON.parse(dados);
} catch (err) {
if (err.code === "ENOENT") {
return [];
}

throw err;
}
}

async function salvarEmprestimos(emprestimos) {
await fs.writeFile(
DATA_FILE,
JSON.stringify(emprestimos, null, 2)
);
}

app.get("/emprestimos", async (req, res, next) => {
try {
const emprestimos = await lerEmprestimos();

const ativos = emprestimos.filter(
(emprestimo) => emprestimo.devolvidoEm === null
);

res.json(ativos);
} catch (err) {
next(err);
}
});

app.get("/emprestimos/:id", async (req, res, next) => {
try {
const id = Number(req.params.id);

const emprestimos = await lerEmprestimos();

const emprestimo = emprestimos.find(
(emprestimo) => emprestimo.id === id
);

if (!emprestimo) {
const erro = new Error("Empréstimo não encontrado");
erro.status = 404;
throw erro;
}

res.json(emprestimo);
} catch (err) {
next(err);
}
});

app.post("/emprestimos", async (req, res, next) => {
try {
const { nomeAluno, livro } = req.body;

if (!nomeAluno) {
const erro = new Error("O campo nomeAluno é obrigatório");
erro.status = 400;
throw erro;
}

if (!livro) {
const erro = new Error("O campo livro é obrigatório");
erro.status = 400;
throw erro;
}

const emprestimos = await lerEmprestimos();

const maiorId = emprestimos.reduce(
(maior, emprestimo) => Math.max(maior, emprestimo.id),
0
);

const novoEmprestimo = {
id: maiorId + 1,
nomeAluno,
livro,
devolvidoEm: null
};

emprestimos.push(novoEmprestimo);

await salvarEmprestimos(emprestimos);

res.status(201).json(novoEmprestimo);
} catch (err) {
next(err);
}
});

app.put("/emprestimos/:id", async (req, res, next) => {
try {
const id = Number(req.params.id);

const { nomeAluno, livro } = req.body;

if (!nomeAluno) {
const erro = new Error("O campo nomeAluno é obrigatório");
erro.status = 400;
throw erro;
}

if (!livro) {
const erro = new Error("O campo livro é obrigatório");
erro.status = 400;
throw erro;
}
const emprestimos = await lerEmprestimos();

const maiorId = emprestimos.reduce(
(maior, emprestimo) => Math.max(maior, emprestimo.id),
0
);

const novoEmprestimo = {
id: maiorId + 1,
nomeAluno,
livro,
devolvidoEm: null
};

emprestimos.push(novoEmprestimo);

await salvarEmprestimos(emprestimos);

res.status(201).json(novoEmprestimo);
} catch (err) {
next(err);
}
});

app.put("/emprestimos/:id", async (req, res, next) => {
try {
const id = Number(req.params.id);

const { nomeAluno, livro } = req.body;

if (!nomeAluno) {
const erro = new Error("O campo nomeAluno é obrigatório");
erro.status = 400;
throw erro;
}

if (!livro) {
const erro = new Error("O campo livro é obrigatório");
erro.status = 400;
throw erro;
}

const emprestimos = await lerEmprestimos();

const indice = emprestimos.findIndex(
(emprestimo) => emprestimo.id === id
);

if (indice === -1) {
const erro = new Error("Empréstimo não encontrado");
erro.status = 404;
throw erro;
}

const emprestimoAtualizado = {
id,
nomeAluno,
livro,
devolvidoEm: emprestimos[indice].devolvidoEm
};

emprestimos[indice] = emprestimoAtualizado;

await salvarEmprestimos(emprestimos);

res.json(emprestimoAtualizado);
} catch (err) {
next(err);
}
});

app.patch("/emprestimos/:id", async (req, res, next) => {
try {
const id = Number(req.params.id);

const emprestimos = await lerEmprestimos();

const indice = emprestimos.findIndex(
(emprestimo) => emprestimo.id === id
);

if (indice === -1) {
const erro = new Error("Empréstimo não encontrado");
erro.status = 404;
throw erro;
}

const emprestimoAtual = emprestimos[indice];

const emprestimoAtualizado = {
...emprestimoAtual,
...req.body,
id: emprestimoAtual.id,
devolvidoEm: emprestimoAtual.devolvidoEm
};

emprestimos[indice] = emprestimoAtualizado;

await salvarEmprestimos(emprestimos);

res.json(emprestimoAtualizado);
} catch (err) {
next(err);
}
});

app.delete("/emprestimos/:id", async (req, res, next) => {
try {
const id = Number(req.params.id);

const emprestimos = await lerEmprestimos();

const indice = emprestimos.findIndex(
(emprestimo) => emprestimo.id === id
);

if (indice === -1) {
const erro = new Error("Empréstimo não encontrado");
erro.status = 404;
throw erro;
}

if (emprestimos[indice].devolvidoEm !== null) {
const erro = new Error("O empréstimo já foi devolvido");
erro.status = 409;
throw erro;
}

emprestimos[indice].devolvidoEm = new Date().toISOString();

await salvarEmprestimos(emprestimos);

res.status(204).send();
} catch (err) {
next(err);
}
});

app.use((req, res) => {
res.status(404).json({
erro: "Rota não encontrada"
});
});

app.use((err, req, res, next) => {
console.error(err);

const status = err.status || 500;

res.status(status).json({
erro: err.message || "Erro interno do servidor"
});
});

app.listen(PORT, () => {
console.log(`Servidor rodando em http://localhost:${PORT}`);
});
