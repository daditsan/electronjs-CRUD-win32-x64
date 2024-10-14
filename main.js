const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'productdb.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        date_added TEXT NOT NULL
    )`);
});

ipcMain.on('add-product', (event, product) => {
    const { name, quantity, date } = product;
    db.run(`INSERT INTO products (name, quantity, date_added) VALUES (?, ?, ?)`, [name, quantity, date], function(err) {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Product added with ID:', this.lastID);
            event.reply('product-added', { id: this.lastID, name, quantity, date });
        }
    });
});

ipcMain.on('fetch-products', (event) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        event.sender.send('products-fetched', rows);
    });
});

ipcMain.on('delete-product', (event, id) => {
    db.run(`DELETE FROM products WHERE id = ?`, id, function (err) {
        if (err) {
            console.error(err.message);
            return;
        }
        console.log(`Product with ID ${id} deleted`);
        event.reply('product-deleted', id);
    });
});

// Search products based on a name query
ipcMain.on('search-products', (event, query) => {
    db.all(`SELECT * FROM products WHERE name LIKE ?`, [`%${query}%`], (err, rows) => {
        if (err) {
            throw err;
        }
        event.sender.send('products-searched', rows); // Send the search results back to the renderer
    });
});



function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

app.on('before-quit', () => {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the SQLite database connection.');
    });
});
