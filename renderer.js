document.getElementById('product-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Prevent the form from submitting

    // Get values from input fields
    const name = document.getElementById('product-name').value;
    const quantity = document.getElementById('product-quantity').value;
    const date = document.getElementById('product-date').value;

    // Create a new row in the table
    const table = document.getElementById('product-table').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td>${name}</td>
        <td>${quantity}</td>
        <td>${date}</td>
        <td><button class="delete-button">Delete</button></td>
    `;

    // Clear input fields
    this.reset();

    // Add event listener to the delete button
    newRow.querySelector('.delete-button').addEventListener('click', function() {
        table.deleteRow(newRow.rowIndex - 1); // Remove the row
    });
});

// Implement search functionality (to be added later)
