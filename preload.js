const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  addImage: (image) => ipcRenderer.invoke('add-image', image),
  getImages: () => ipcRenderer.invoke('get-images'),
  removeImage: (imageId) => ipcRenderer.invoke('remove-image', imageId)
})