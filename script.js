const apiUrl = 'http://localhost:3000';

function displayResponse(elementId, data, error = false) {
    const element = document.getElementById(elementId);
    const rawResponseElement = document.getElementById('rawResponse');

    if (error) {
        const errorMessage = data.error || 'Ocorreu um erro desconhecido.';
        element.innerHTML = `<p style="color: red;"><strong>Erro:</strong> ${JSON.stringify(errorMessage)}</p>`;
        rawResponseElement.textContent = JSON.stringify(data, null, 2);
    } else {
        element.innerHTML = `<p style="color: green;"><strong>Sucesso:</strong></p><pre>${JSON.stringify(data, null, 2)}</pre>`;
        rawResponseElement.textContent = JSON.stringify(data, null, 2);
    }
}

async function createOrder() {
    const numeroPedido = document.getElementById('numeroPedido').value;
    const valorTotal = document.getElementById('valorTotal').value;
    const dataCriacao = document.getElementById('dataCriacao').value;
    const idItem = document.getElementById('idItem').value;
    const quantidadeItem = document.getElementById('quantidadeItem').value;

    // Validação de entrada no frontend
    if (!numeroPedido || !valorTotal || !dataCriacao || !idItem || !quantidadeItem) {
        displayResponse('createOrderResult', { error: 'Todos os campos são obrigatórios.' }, true);
        return;
    }

    const payload = {
        numeroPedido: numeroPedido,
        valorTotal: parseFloat(valorTotal),
        dataCriacao: dataCriacao,
        items: [
            {
                idItem: idItem,
                quantidadeItem: parseInt(quantidadeItem)
            }
        ]
    };

    try {
        const response = await fetch(apiUrl + '/order', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        displayResponse('createOrderResult', data, !response.ok);
    } catch (error) {
        displayResponse('createOrderResult', { error: error.message }, true);
    }
}

async function getOrder() {
    const orderId = document.getElementById('getOrderId').value;
    if (!orderId) {
        displayResponse('getOrderResult', { error: 'O ID do pedido é obrigatório.' }, true);
        return;
    }
    try {
        const response = await fetch(`${apiUrl}/order/${orderId}`);
        const data = await response.json();
        displayResponse('getOrderResult', data, !response.ok);
    } catch (error) {
        displayResponse('getOrderResult', { error: error.message }, true);
    }
}

async function listOrders() {
    try {
        const response = await fetch(apiUrl + '/order/list');
        const data = await response.json();
        displayResponse('listOrdersResult', data, !response.ok);
    } catch (error) {
        displayResponse('listOrdersResult', { error: error.message }, true);
    }
}

async function updateOrder() {
    const orderId = document.getElementById('updateOrderId').value;
    const valorTotal = document.getElementById('updateValorTotal').value;

    if (!orderId || !valorTotal) {
        displayResponse('updateOrderResult', { error: 'ID do pedido e novo valor são obrigatórios.' }, true);
        return;
    }

    const payload = {
        valorTotal: parseFloat(valorTotal)
    };

    try {
        const response = await fetch(`${apiUrl}/order/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        displayResponse('updateOrderResult', data, !response.ok);
    } catch (error) {
        displayResponse('updateOrderResult', { error: error.message }, true);
    }
}

async function deleteOrder() {
    const orderId = document.getElementById('deleteOrderId').value;
    if (!orderId) {
        displayResponse('deleteOrderResult', { error: 'O ID do pedido é obrigatório.' }, true);
        return;
    }
    try {
        const response = await fetch(`${apiUrl}/order/${orderId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        displayResponse('deleteOrderResult', data, !response.ok);
    } catch (error) {
        displayResponse('deleteOrderResult', { error: error.message }, true);
    }
}
