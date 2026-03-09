# API de Gerenciamento de Pedidos (Node.js Puro)

Esta é uma API RESTful simples desenvolvida em **Node.js puro** (sem dependências externas como Express ou body-parser) para gerenciar pedidos. Os dados dos pedidos são persistidos em um arquivo JSON (`arquivo.json`). Uma interface HTML (`index.html`) com JavaScript (`script.js`) é fornecida para facilitar os testes.

## Funcionalidades

A API oferece as seguintes operações para gerenciamento de pedidos:

- **Criação de Pedido**: Adiciona um novo pedido com mapeamento de campos.
- **Leitura de Pedido**: Obtém os detalhes de um pedido específico pelo seu ID.
- **Listagem de Pedidos**: Retorna todos os pedidos registrados.
- **Atualização de Pedido**: Modifica os dados de um pedido existente.
- **Exclusão de Pedido**: Remove um pedido pelo seu ID.

## Mapeamento de Dados

A API realiza um mapeamento dos dados de entrada para um formato padronizado antes de salvar. Abaixo está o exemplo de como os dados são transformados:

**JSON de Entrada (Exemplo):**
```json
{
  "numeroPedido": "v10089015vdb-01",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
  "items": [
    {
      "idItem": "2434",
      "quantidadeItem": 1,
      "valorItem": 1000
    }
  ]
}
```

**JSON Salvo (Exemplo):**
```json
{
  "orderId": "v10089015vdb",
  "value": 10000,
  "creationDate": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1
    }
  ]
}
```

Observe que `numeroPedido` é mapeado para `orderId` (removendo o sufixo `-01`), `valorTotal` para `value`, `dataCriacao` para `creationDate` (em formato ISO simplificado), `idItem` para `productId` e `quantidadeItem` para `quantity`.

## Como Executar o Projeto

Siga os passos abaixo para configurar e executar a API localmente:

### Pré-requisitos

Certifique-se de ter o Node.js instalado em sua máquina. Nenhuma dependência externa é necessária.

### Instalação

1. Crie um diretório para o projeto e salve os arquivos `app.js`, `index.html`, `script.js` e `package.json` dentro dele.
2. O arquivo `arquivo.json` será criado automaticamente na primeira execução, se não existir.
3. Navegue até o diretório do projeto no terminal:
   ```bash
   cd /home/ubuntu/order-api
   ```

### Execução

Para iniciar o servidor da API, execute o seguinte comando:

```bash
node app.js
```

O servidor será iniciado na porta `3000`. Você verá a mensagem no console:

```
Servidor Node.js puro rodando em http://localhost:3000
```

### Testando a API com a Interface HTML

Após iniciar o servidor, você pode acessar a interface de teste HTML diretamente no seu navegador, visitando:

`http://localhost:3000/`

Esta página oferece formulários e botões para interagir com todos os endpoints da API (Criar, Obter, Listar, Atualizar, Deletar) de forma simples.

## Endpoints da API

A seguir, a documentação dos endpoints disponíveis:

### 1. Criar um Novo Pedido

- **URL:** `POST http://localhost:3000/order`
- **Descrição:** Cria um novo pedido no sistema.
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON):**
  ```json
  {
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }
  ```
- **Exemplo de `curl`:**
  ```bash
  curl -X POST http://localhost:3000/order \
  -H "Content-Type: application/json" \
  -d \'{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2023-07-19T12:24:11.5299601+00:00",
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 1,
        "valorItem": 1000
      }
    ]
  }\'
  ```

### 2. Obter Dados do Pedido

- **URL:** `GET http://localhost:3000/order/:orderId`
- **Descrição:** Retorna os detalhes de um pedido específico.
- **Parâmetros de URL:**
  - `:orderId` (string, obrigatório): O ID do pedido (ex: `v10089015vdb`).
- **Exemplo de `curl`:**
  ```bash
  curl http://localhost:3000/order/v10089015vdb
  ```

### 3. Listar Todos os Pedidos

- **URL:** `GET http://localhost:3000/order/list`
- **Descrição:** Retorna uma lista de todos os pedidos registrados.
- **Exemplo de `curl`:**
  ```bash
  curl http://localhost:3000/order/list
  ```

### 4. Atualizar Pedido

- **URL:** `PUT http://localhost:3000/order/:orderId`
- **Descrição:** Atualiza os dados de um pedido existente. Você pode enviar `valorTotal` e/ou `items` para atualização.
- **Parâmetros de URL:**
  - `:orderId` (string, obrigatório): O ID do pedido a ser atualizado.
- **Headers:**
  - `Content-Type: application/json`
- **Body (JSON - Exemplo de atualização de valor e itens):**
  ```json
  {
    "valorTotal": 12000,
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 2,
        "valorItem": 1000
      },
      {
        "idItem": "5678",
        "quantidadeItem": 1,
        "valorItem": 2000
      }
    ]
  }
  ```
- **Exemplo de `curl`:**
  ```bash
  curl -X PUT http://localhost:3000/order/v10089015vdb \
  -H "Content-Type: application/json" \
  -d \'{
    "valorTotal": 12000,
    "items": [
      {
        "idItem": "2434",
        "quantidadeItem": 2,
        "valorItem": 1000
      }
    ]
  }\'
  ```

### 5. Deletar Pedido

- **URL:** `DELETE http://localhost:3000/order/:orderId`
- **Descrição:** Exclui um pedido do sistema.
- **Parâmetros de URL:**
  - `:orderId` (string, obrigatório): O ID do pedido a ser deletado.
- **Exemplo de `curl`:**
  ```bash
  curl -X DELETE http://localhost:3000/order/v10089015vdb
  ```

## Estrutura do Projeto

```
order-api/
├── app.js            # Servidor Node.js puro e lógica dos endpoints
├── arquivo.json      # Arquivo onde os dados dos pedidos são armazenados
├── index.html        # Interface HTML simples para testes da API
├── script.js         # Lógica JavaScript para a interface HTML
└── package.json      # Metadados do projeto e script de inicialização
└── README.md         # Documentação do projeto
```

---
