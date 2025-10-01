Neutralino.init();



async function Minimise(){
    await Neutralino.window.minimize();
}

async function Maximise(){
    await Neutralino.window.maximise();
}

async function UnMaximise(){
    await Neutralino.window.unmaximise();
}

async function ToggleMaximise(){
    if(await Neutralino.window.isMaximized()){
        UnMaximise();
    }
    else{
        Maximise();
    }
}

function Exit(){
    Neutralino.window.exit();
}



const libraryContainer = document.getElementById('libraryContainer');
const libraryEntryList = document.getElementById('libraryEntryList');
const displayContainer = document.getElementById('displayContainer');
const imageDisplay = document.getElementById('imageDisplay');
var entryElements = Array.from(document.getElementsByClassName('entry'));

libraryContainer.addEventListener('dragover', (event) => OnLibraryDragOver(event));
displayContainer.addEventListener('dragover', (event) => OnDisplayDragOver(event));
libraryContainer.addEventListener('drop', (event) => OnImageDropped(event));

entryElements.forEach(entry => {
    let src = entry.getElementsByTagName('img')[0].src;
    entry.addEventListener('click', (event) => OnSelectImage(event, src));
});
libraryContainer.addEventListener('click', (event) => OnImageDeselected(event));



function OnLibraryDragOver(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
}

function OnDisplayDragOver(event){
    event.preventDefault();
    event.dataTransfer.dropEffect = "none";
}

function OnImageDropped(event){
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 1) {
        AddImageSet(files);  
    }
    else{
        AddImage(files[0]);  
    }
}

function OnSelectImage(event, imageSrc){
    event.stopPropagation();
    SelectImage(imageSrc)
}

function OnImageDeselected(event){
    DeselectImage();
}



function AddImage(image){
    if (image == null || !image.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let src = event.target.result;
        SelectImage(src);
        CreateEntry(src);
    };
    reader.readAsDataURL(image);
}

function AddImageSet(images){
    // TODO: Add actual image set.
    // Currently just adds the first image in the set.
    AddImage(images[0]);  
}

function CreateEntry(imageSrc){
    let newEntry = document.createElement('li');
    newEntry.classList.add('entry');

    let newEntryThumbnailContainer = document.createElement('div');
    newEntryThumbnailContainer.classList.add('entryThumbnailContainer');

    let newEntryThumbnail = document.createElement('img');
    newEntryThumbnail.classList.add('entryThumbnail');
    newEntryThumbnail.src = imageSrc;

    newEntryThumbnailContainer.appendChild(newEntryThumbnail);
    newEntry.appendChild(newEntryThumbnailContainer);

    libraryEntryList.appendChild(newEntry);
    console.log(imageSrc);
    newEntry.addEventListener('click', (event) => OnSelectImage(event, imageSrc))
}

function SelectImage(imageSrc){
    if(imageSrc == null){
        DeselectImage()
        return;
    }

    imageDisplay.src = imageSrc;
}

function DeselectImage(){
    imageDisplay.src = "";
}