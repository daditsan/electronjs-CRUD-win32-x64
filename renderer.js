const { ipcRenderer } = require('electron');

// Add product event listener
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get product details from form inputs
    const name = document.getElementById('product-name').value;
    const quantity = document.getElementById('product-quantity').value;
    const date = document.getElementById('product-date').value;

    // Send the product data to the main process
    ipcRenderer.send('add-product', { name, quantity, date });

    // Clear the form inputs after submission
    document.getElementById('product-form').reset();
});

// Search event listener
document.getElementById('search').addEventListener('input', function (e) {
    const query = e.target.value; // Get the input value
    if (query) {
        ipcRenderer.send('search-products', query); // Send the search query to the main process
    } else {
        fetchProducts(); // If the input is empty, fetch all products
    }
});

// Listen for a response from the main process after adding a product
ipcRenderer.on('product-added', (event, response) => {
    console.log(`Product added with ID: ${response.id}`);
    fetchProducts(); // Refresh the product list after adding
});

// Function to fetch and display products
function fetchProducts() {
    ipcRenderer.send('fetch-products'); // Request product data from the main process
}

// Listen for the products fetched event
ipcRenderer.on('products-fetched', (event, products) => {
    updateProductList(products); // Use the function to update the UI
});

// Listen for search results
ipcRenderer.on('products-searched', (event, products) => {
    updateProductList(products); // Use the function to update the UI with search results
});

// Function to update the product list in the UI
function updateProductList(products) {
    const productTableBody = document.querySelector('#product-table tbody'); // Select the tbody of the table
    productTableBody.innerHTML = ''; // Clear the existing rows

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>${product.date_added}</td>
            <td><button onclick="deleteProduct(${product.id})">Delete</button></td>
        `;
        productTableBody.appendChild(row); // Append the row to the table body
    });
}

// Function to delete a product
function deleteProduct(id) {
    ipcRenderer.send('delete-product', id);
}

// Listen for confirmation of deletion and refresh the product list
ipcRenderer.on('product-deleted', (event, id) => {
    console.log(`Product with ID ${id} deleted`);
    fetchProducts(); // Refresh the product list after deletion
});

// Fetch products when the app starts
fetchProducts(); // Load the product list initially
