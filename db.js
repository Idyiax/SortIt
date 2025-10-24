const Database = require('better-sqlite3')
const path = require('path')

module.exports = {
    addImage: AddImage
};

console.log(process.env.NODE_ENV);
const dbPath = process.env.NODE_ENV === 'development' ? './database.db' : path.join(process.resourcesPath, 'database.db')

const db = new Database(dbPath)

console.log('Database path:', dbPath);


const createTables = `
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL
    );
`

try{
    db.exec(createTables);
}
catch (error){
    console.error('Error creating database tables:', error);
}


const addImageSql = db.prepare('INSERT INTO images (path) VALUES (?)');

function AddImage(imagePath){
    try {
        addImageSql.run(imagePath);
    }
    catch (error){
        console.error('Error adding image to database:', error)
        throw error;
    }
}