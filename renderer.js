const { ipcRenderer } = require('electron');

// Add product event listener
document.getElementById('product-form').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get product details from form inputs
    // const name = document.getElementById('product-name').value;
    const saldo = document.getElementById('product-quantity').value;

    // const date = document.getElementById('product-date').value;
    const dateInput = document.getElementById('product-date').value;
    const currentTime = new Date().toTimeString().split(' ')[0]; // Format the time into HH:MM:SS
    const date = `${dateInput} ${currentTime}`

    const transactionNumber = document.getElementById('transaction-number').value;
    const description = document.getElementById('description').value;
    const masuk = document.getElementById('masuk').value;
    const keluar = document.getElementById('keluar').value;

    // Send the product data to the main process
    ipcRenderer.send('add-product', { 
        // name, 
        saldo, 
        date,
        transactionNumber, 
        description, 
        masuk, 
        keluar  
    });

    // Clear the form inputs after submission
    document.getElementById('product-form').reset();
});

// Date filter event listener
document.getElementById('filter-date-button').addEventListener('click', function () {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate) {
        ipcRenderer.send('filter-products-by-date', { startDate, endDate });
    }
});

// Reset filter event listener
document.getElementById('reset-button').addEventListener('click', function () {
    // Clear the date inputs
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';

    // Fetch all products (reset the view)
    fetchProducts();
});


// Listen for the filtered products based on date range
ipcRenderer.on('products-filtered-by-date', (event, products) => {
    updateProductList(products); // Reuse the function to update the product list
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
            <td>${product.date_added}</td>
            <td>${product.transactionNumber}</td>
            <td>${product.description}</td>
            <td>${product.masuk}</td>
            <td>${product.keluar}</td>
            <td>${product.saldo}</td>
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
