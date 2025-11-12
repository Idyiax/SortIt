const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  addImage: (image) => ipcRenderer.invoke('add-image', image),
  getImages: () => ipcRenderer.invoke('get-images'),
  removeImage: (imageId) => ipcRenderer.invoke('remove-image', imageId),
  setName: (entryId, name) => ipcRenderer.invoke('set-image-name', entryId, name),
  getTags: (entryId) => ipcRenderer.invoke('get-tags', entryId),
  addTag: (entryId, tagName) => ipcRenderer.invoke('add-tag', entryId, tagName),
  removeTag: (entryId, tagId) => ipcRenderer.invoke('remove-tag', entryId, tagId),})