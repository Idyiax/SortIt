const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs').promises
const { existsSync, mkdirSync } = require('node:fs')
const db = require('./db');

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      })

    win.loadFile('index.html');
    win.setMenuBarVisibility(false);
}



app.whenReady().then(createWindow)

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



// IPC Handlers
ipcMain.handle('add-image', AddImage)

ipcMain.handle('get-images', () => {
  try{
    return db.getImages();
  }
  catch (error){
    console.error(error);
    return[];
  }
})

ipcMain.handle('remove-image', (event, imageId) => {
  try{
    fs.unlink(db.getImage(imageId).path);
    db.removeImage(imageId);
  }
  catch (error){
    console.error(error);
  }
})

ipcMain.handle('set-image-name', (event, imageId, name) => {
  try{
    db.setName(imageId, name);
  }
  catch (error){
    console.error(error);
  }
})

ipcMain.handle('get-tags', (event, entryId) => {
  try{
    return db.getTags(entryId);
  }
  catch (error){
    console.error(error);
  }
});

ipcMain.handle('add-tag', (event, entryId, tagName) => {
  try{
    let tag = db.findTag(tagName);
    if(!tag){
      tag = db.createTag(tagName);
    }
    db.addTag(entryId, tag.id);
    return tag;
  }
  catch(error){
    console.error(error);
  }
});

ipcMain.handle('remove-tag', (event, entryId, tagId) => {
  try{
    db.removeTag(entryId, tagId);
  }
  catch(error){
    console.error(error);
  }
});

// Functions
async function AddImage(event, image){
  try{
    // Expecting an object { src: 'data:<mime>;base64,<data>', type: 'image/png' }
    if(!image || !image.src || !image.type.startsWith('image/')) {
      console.warn('Invalid file: ', image);
      return;
    }

    // Ensure images directory exists inside userData
    const imagesDir = path.join(app.getPath('pictures'), 'SortIt');
    if(!existsSync(imagesDir)) mkdirSync(imagesDir);

    // Parse src to mime type and base64 data
    const matches = image.src.match(/^data:(.+);base64,(.*)$/);
    if(!matches) {
      console.warn('Image src is not a base64 data URL');
      return;
    }
    const mimeType = matches[1];
    const dataBase64 = matches[2];

    // Name file using timestamp
    const extension = mimeType.split('/')[1];
    const fileName = `${Date.now()}.${extension}`;
    const filePath = path.join(imagesDir, fileName);

    const entryRow = db.addImage(filePath);

    const buffer = Buffer.from(dataBase64, 'base64');
    await fs.writeFile(filePath, buffer);
   
    console.log('Saved image to', filePath);

    return entryRow;
  }
  catch(error){
    console.error('Failed to save image', error);
    return undefined;
  }
}