const Database = require('better-sqlite3')
const path = require('path')

module.exports = {
    addImage: AddImage,
    getImage: GetImage,
    getImages: GetImages,
    removeImage: RemoveImage,
    setName: SetName,
    findTag: FindTag,
    getTags: GetEntryTags,
    createTag: CreateTag,
    addTag: AddEntryTag,
    removeTag: RemoveEntryTag,
};

const dbPath = process.env.NODE_ENV === 'development' ? './database.db' : path.join(process.resourcesPath, 'database.db')

const db = new Database(dbPath)
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const createTables = `
    CREATE TABLE IF NOT EXISTS images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        path TEXT NOT NULL,
        name TEXT
    );

    CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tagLinks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        imageId INTEGER NOT NULL,
        tagId INTEGER NOT NULL,
        FOREIGN KEY (imageId) REFERENCES images (id),
        FOREIGN KEY (tagId) REFERENCES tags (id)
    );
`

try{
    db.exec(createTables);
}
catch (error){
    console.error('Error creating database tables:', error);
}


const createImageSql = db.prepare('INSERT INTO images (path) VALUES (?)');
const getImageSQL = db.prepare('SELECT * FROM images WHERE id=(?)');
const getImagesSql = db.prepare('SELECT * FROM images');
const removeImageSql = db.prepare('DELETE FROM images WHERE id=(?)');
const setImageNameSql = db.prepare('UPDATE images SET name=(?) WHERE id=(?)');
const getTagSql = db.prepare('SELECT * FROM tags WHERE id=(?)');
const findTagSql = db.prepare('SELECT * FROM tags WHERE name=(?)');
const checkEntryTagSql = db.prepare('SELECT * FROM tagLinks WHERE imageId=(?) AND tagId=(?)');
const getEntryTagsSql = db.prepare('SELECT tags.* FROM tags JOIN tagLinks ON tags.id = tagLinks.tagId WHERE tagLinks.imageId=(?)');
const createTagSql = db.prepare('INSERT INTO tags (name) VALUES (?)');
const addEntryTagSql = db.prepare('INSERT INTO tagLinks (imageId, tagId) VALUES (?,?)');
const removeEntryTagSql = db.prepare('DELETE FROM tagLinks WHERE imageId=(?) AND tagId=(?)');


function AddImage(imagePath){
    try {
        const newImageId = createImageSql.run(imagePath).lastInsertRowid;
        return getImageSQL.get(newImageId);
    }
    catch (error){
        console.error('Error adding image:', error)
        throw error;
    }
}

function GetImage(imageId){
    try {
        return getImageSQL.get(imageId);
    }
    catch (error){
        console.error(`Could not find an image with the id ${imageId}:`, error);
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
        console.error('Error removing image:', error);
        throw error;
    }
}

function SetName(imageId, name){
    try {
        setImageNameSql.run(name, imageId);
    }
    catch (error){
        console.error('Error naming image:', error);
        throw error;
    }
}

function GetTag(tagId){
    try {
        return getTagSql.get(tagId);
    }
    catch (error){
        console.error(`Could not find a tag with the id ${tagId}:`, error);
        throw error;
    }
}

function FindTag(tagName){
    try {
        return findTagSql.get(tagName);
    }
    catch (error){
        console.error(`Could not find a tag with the name ${tagName}:`, error);
        throw error;
    }
}

function GetEntryTags(entryId){
    return tags = getEntryTagsSql.all(entryId);
}

function CreateTag(tagName){
    try {
        if(FindTag(tagName)) return 'A tag with this name already exists.'
        const newTagId = createTagSql.run(tagName).lastInsertRowid;
        return GetTag(newTagId);
    }
    catch (error){
        console.error('Error creating tag:', error)
        throw error;
    }
}

function AddEntryTag(entryId, tagId){
    try {
        if(checkEntryTagSql.get(entryId, tagId)) return;
        addEntryTagSql.run(entryId, tagId);
    }
    catch (error){
        console.error('Error adding tag', error)
        throw error;
    }
}

function RemoveEntryTag(entryId, tagId){
    try {
        removeEntryTagSql.run(entryId, tagId);
    }
    catch (error){
        console.error('Error removing tag from entry:', error)
        throw error;
    }
}