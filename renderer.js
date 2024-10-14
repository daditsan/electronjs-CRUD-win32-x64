const { ipcRenderer } = require('electron');

// Add product event listener
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const name = document.getElementById('product-name').value;
    const quantity = document.getElementById('product-quantity').value;
    const date = document.getElementById('product-date').value;

    ipcRenderer.send('add-product', { name, quantity, date });
    document.getElementById('product-form').reset();
});

ipcRenderer.on('product-added', (event, response) => {
    console.log(`Product added with ID: ${response.id}`);
    fetchProducts(); // Refresh the product list after adding
});

// Function to fetch and display products
function fetchProducts() {
    ipcRenderer.send('fetch-products');
}

ipcRenderer.on('products-fetched', (event, products) => {
    const productTableBody = document.querySelector('#product-table tbody');
    productTableBody.innerHTML = ''; // Clear the existing rows

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.date_added}</td>
            <td><button onclick="deleteProduct(${product.id})">Delete</button></td>
        `;
        productTableBody.appendChild(row);
    });
});

// Function to delete a product
function deleteProduct(id) {
    ipcRenderer.send('delete-product', id);
}

ipcRenderer.on('product-deleted', (event, id) => {
    console.log(`Product with ID ${id} deleted`);
    fetchProducts(); // Refresh the product list after deletion
});

// Fetch products when the app starts
fetchProducts(); // Load the product list initially
