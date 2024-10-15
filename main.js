const { app, BrowserWindow, ipcMain } = require('electron');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'productdb.sqlite2');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database.');
});

const seedDatabase = () => {
    const initialProducts = [
        { transactionNumber: 'S240001', masuk: 1400, keluar: 0, saldo: 1400, date_added: '2024-07-01 09:00:00', description: 1 },
        { transactionNumber: 'S240001', masuk: 3220, saldo: 3220, keluar: 0, date_added: '2024-07-02 09:00:00', description: 1 },
        { transactionNumber: 'S240001', masuk: 5310, saldo: 5310, keluar: 0,  date_added: '2024-07-03 09:00:00', description: 1 },
        { transactionNumber: 'S240005', masuk: 0, saldo: 1430, keluar: 1430,  date_added: '2024-05-03 11:00:00', description: 2 },
        { transactionNumber: 'S240005', masuk: 0, saldo: 3610, keluar: 3610,  date_added: '2024-05-03 11:00:00', description: 2 },
        { transactionNumber: 'S240005', masuk: 0, saldo: 4310, keluar: 4310,  date_added: '2024-05-03 11:00:00', description: 2 },
        { transactionNumber: 'S240007', masuk: 0, saldo: 1385, keluar: 1385,  date_added: '2024-14-03 09:00:00', description: 2 },
        { transactionNumber: 'S240007', masuk: 0, saldo: 2175, keluar: 2175,  date_added: '2024-14-03 09:00:00', description: 2 },
        { transactionNumber: 'S240007', masuk: 0, saldo: 4280, keluar: 4280,  date_added: '2024-14-03 09:00:00', description: 2 },
        { transactionNumber: 'S240001', masuk: 0, saldo: 5310, keluar: 0,  date_added: '2024-07-03 09:00:00', description: 1 },
    ];

    initialProducts.forEach(product => {
        db.run(`INSERT INTO products (transactionNumber, saldo, date_added, description, masuk, keluar) VALUES (?, ?, ?, ?, ?, ?)`, [product.transactionNumber, product.saldo, product.date_added, product.masuk, product.keluar, product.description], function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Seeded Product added with ID:', this.lastID);
            }
        });
    });
};



// db.serialize(() => {
//     db.run(`CREATE TABLE IF NOT EXISTS products (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         date_added TEXT NOT NULL,         -- Tanggal
//         transactionNumber TEXT,          -- No. Trx
//         description INTEGER,              -- Keterangan
//         masuk INTEGER NOT NULL DEFAULT 0, -- Masuk
//         keluar INTEGER NOT NULL DEFAULT 0, -- Keluar
//         saldo INTEGER NOT NULL DEFAULT 0   -- Saldo
//     )`);
// });

        

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date_added TEXT NOT NULL,         -- Tanggal
        transactionNumber TEXT,          -- No. Trx
        description INTEGER,              -- Keterangan
        masuk INTEGER NOT NULL DEFAULT 0, -- Masuk
        keluar INTEGER NOT NULL DEFAULT 0, -- Keluar
        saldo INTEGER NOT NULL DEFAULT 0   -- Saldo
    )`, (err) => {
        if (err) {
            return console.error(err.message);
        }

        // Optionally check if the table is empty before seeding
        db.all(`SELECT COUNT(*) AS count FROM products`, [], (err, rows) => {
            if (err) {
                throw err;
            }
            if (rows[0].count === 0) {
                seedDatabase();
            }
        });
    });
});



ipcMain.on('add-product', (event, product) => {
    const {saldo, date, transactionNumber, description, masuk, keluar } = product;
    db.run(`INSERT INTO products (saldo, date_added, transactionNumber, description, masuk, keluar) VALUES (?, ?, ?, ?, ?, ?)`, 
        [saldo, date, transactionNumber, description, masuk, keluar], 
        function(err) {
            if (err) {
                console.error(err.message);
            } else {
                console.log('Product added with ID:', this.lastID);
                event.reply('product-added', { 
                    id: this.lastID, 
                    saldo, 
                    date, 
                    transactionNumber, 
                    description, 
                    masuk, 
                    keluar 
                });
            }
        }
    );
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

// Filter products by date range
ipcMain.on('filter-products-by-date', (event, { startDate, endDate }) => {
    db.all(
        `SELECT * FROM products WHERE date_added BETWEEN ? AND ?`, 
        [startDate, endDate], 
        (err, rows) => {
            if (err) {
                throw err;
            }
            event.sender.send('products-filtered-by-date', rows); // Send back the filtered products
        }
    );
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
