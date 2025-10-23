const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('node:fs').promises
const { existsSync, mkdirSync } = require('node:fs')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: path.join(__dirname, 'preload.js')
        }
      })

    win.loadFile('index.html')
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

    const buffer = Buffer.from(dataBase64, 'base64');
    await fs.writeFile(filePath, buffer);
    console.log('Saved image to', filePath);
  }
  catch(err){
    console.error('Failed to save image', err);
  }
}