const Database = require('better-sqlite3')
const path = require('path')

module.exports = {
    addImage: AddImage,
    getImages: GetImages
};

const dbPath = process.env.NODE_ENV === 'development' ? './database.db' : path.join(process.resourcesPath, 'database.db')

const db = new Database(dbPath)
db.pragma('journal_mode = WAL');

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
const getImageSQL = db.prepare('SELECT * FROM images WHERE id=(?)');

function AddImage(imagePath){
    try {
        const newImageId = addImageSql.run(imagePath).lastInsertRowid;
        return getImageSQL.get(newImageId);
    }
    catch (error){
        console.error('Error adding image to database:', error)
        throw error;
    }
}

const getImagesSql = db.prepare('SELECT * FROM iMAGES');

function GetImages(){
    return getImagesSql.all();
}