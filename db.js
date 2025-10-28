const Database = require('better-sqlite3')
const path = require('path')

module.exports = {
    addImage: AddImage,
    getImage: GetImage,
    getImages: GetImages,
    removeImage: RemoveImage,
    setName: SetName,
};

const dbPath = process.env.NODE_ENV === 'development' ? './database.db' : path.join(process.resourcesPath, 'database.db')

const db = new Database(dbPath)
db.pragma('journal_mode = WAL');

const createTables = `
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        name TEXT
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
const getImagesSql = db.prepare('SELECT * FROM images');
const removeImageSql = db.prepare('DELETE FROM images WHERE id=(?)');
const setImageNameSql = db.prepare('UPDATE images SET name=(?) WHERE id=(?)');

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

function GetImage(imageId){
    try {
        return getImageSQL.get(imageId);
    }
    catch (error){
        console.error('Error getting image from database:', error);
        throw error;
    }
}

function GetImages(){
    return getImagesSql.all();
}

function RemoveImage(imageId){
    try {
        removeImageSql.run(imageId);
    }
    catch (error){
        console.error('Error removing image from database:', error);
        throw error;
    }
}

function SetName(imageId, name){
    try {
        setImageNameSql.run(name, imageId);
    }
    catch (error){
        console.error('Error naming image in database:', error);
        throw error;
    }
}