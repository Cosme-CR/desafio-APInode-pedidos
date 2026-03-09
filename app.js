const http = require("http");
const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(__dirname, "arquivo.json");

// Inicializa o arquivo JSON se não existir
if (!fs.existsSync(DATA_FILE) || fs.readFileSync(DATA_FILE, "utf8").trim() === "") {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Função para ler os pedidos do arquivo JSON
const readOrders = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, "utf8");
        const parsedData = JSON.parse(data);
        if (!Array.isArray(parsedData)) {
            console.warn("arquivo.json não é um array. Inicializando como array vazio.");
            return [];
        }
        return parsedData;
    } catch (err) {
        console.error("Erro ao ler arquivo JSON:", err);
        return [];
    }
};

// Função para salvar os pedidos no arquivo JSON
const saveOrders = (orders) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2));
        return true;
    } catch (err) {
        console.error("Erro ao salvar arquivo JSON:", err);
        return false;
    }
};

// Função de mapeamento conforme solicitado no desafio
const mapOrderInput = (input) => {
    // Validação básica de entrada
    if (!input || typeof input !== "object" || !input.numeroPedido || !input.valorTotal || !input.dataCriacao || !Array.isArray(input.items)) {
        throw new Error("Dados de pedido inválidos.");
    }

    const orderId = input.numeroPedido.split("-")[0];
    const creationDate = new Date(input.dataCriacao).toISOString();

    const items = input.items.map(item => {
        if (!item || typeof item !== "object" || !item.idItem || !item.quantidadeItem) {
            throw new Error("Dados de item inválidos.");
        }
        return {
            productId: parseInt(item.idItem),
            quantity: parseInt(item.quantidadeItem)
        };
    });

    return {
        orderId: orderId,
        value: parseFloat(input.valorTotal),
        creationDate: creationDate,
        items: items
    };
};

const server = http.createServer((req, res) => {
    // Configurações de CORS para permitir requisições do frontend
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permitir qualquer origem para testes
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Lidar com requisições OPTIONS (preflight requests)
    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    const { method, url } = req;
    const parts = url.split("/");

    // Servir arquivos estáticos pro front
    if (url === "/" || url === "/index.html") {
        fs.readFile(path.join(__dirname, "index.html"), (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Erro interno do servidor");
                return;
            }
            res.writeHead(200, { "Content-Type": "text/html" });
            res.end(data);
        });
        return;
    }

    if (url === "/script.js") {
        fs.readFile(path.join(__dirname, "script.js"), (err, data) => {
            if (err) {
                res.writeHead(500, { "Content-Type": "text/plain" });
                res.end("Erro interno do servidor");
                return;
            }
            res.writeHead(200, { "Content-Type": "application/javascript" });
            res.end(data);
        });
        return;
    }

    // Rotas da API
    if (url.startsWith("/order")) {
        let body = "";
        req.on("data", chunk => {
            body += chunk.toString();
        });

        req.on("end", () => {
            let payload;
            if (body) {
                try {
                    payload = JSON.parse(body);
                } catch (e) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "JSON inválido" }));
                    return;
                }
            }

            let orders = readOrders();

            // POST /order - Criar um novo pedido
            if (method === "POST" && url === "/order") {
                try {
                    const mappedOrder = mapOrderInput(payload);
                    if (orders.some(o => o.orderId === mappedOrder.orderId)) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Pedido já existe" }));
                        return;
                    }
                    orders.push(mappedOrder);
                    saveOrders(orders);
                    res.writeHead(201, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Pedido criado com sucesso", order: mappedOrder }));
                } catch (e) {
                    res.writeHead(400, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: e.message }));
                }
                return;
            }

            // GET /order/list - Listar todos os pedidos
            if (method === "GET" && url === "/order/list") {
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify(orders));
                return;
            }

            // Rotas com orderId (GET, PUT, DELETE)
            if (parts.length === 3 && parts[1] === "order") {
                const orderId = parts[2];
                const index = orders.findIndex(o => o.orderId === orderId);

                // GET  Obter dados do pedido
                if (method === "GET") {
                    if (index === -1) {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Pedido não encontrado" }));
                        return;
                    }
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(orders[index]));
                    return;
                }

                // PUT  Atualizar pedido
                if (method === "PUT") {
                    if (index === -1) {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Pedido não encontrado" }));
                        return;
                    }
                    try {
                        // Apenas atualiza os campos fornecidos, sem remapear o pedido inteiro
                        if (payload.valorTotal !== undefined) orders[index].value = parseFloat(payload.valorTotal);
                        if (payload.items !== undefined) {
                            if (!Array.isArray(payload.items)) throw new Error("Items devem ser um array.");
                            orders[index].items = payload.items.map(item => {
                                if (!item || typeof item !== "object" || !item.idItem || !item.quantidadeItem) {
                                    throw new Error("Dados de item inválidos para atualização.");
                                }
                                return {
                                    productId: parseInt(item.idItem),
                                    quantity: parseInt(item.quantidadeItem)
                                };
                            });
                        }
                        saveOrders(orders);
                        res.writeHead(200, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ message: "Pedido atualizado com sucesso", order: orders[index] }));
                    } catch (e) {
                        res.writeHead(400, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: e.message }));
                    }
                    return;
                }

                // DELETE /order/:orderId - Deletar pedido
                if (method === "DELETE") {
                    if (index === -1) {
                        res.writeHead(404, { "Content-Type": "application/json" });
                        res.end(JSON.stringify({ error: "Pedido não encontrado" }));
                        return;
                    }
                    orders.splice(index, 1);
                    saveOrders(orders);
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ message: "Pedido deletado com sucesso" }));
                    return;
                }
            }

            // Rota não encontrada
            res.writeHead(404, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Rota não encontrada" }));
        });
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor Node.js puro rodando em http://localhost:${PORT}`);
});
