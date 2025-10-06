Neutralino.init();



// Neutralino functions
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


// Vars
var SelectedEntryIndex; // The index of the currently selected entry.
var DisplayedEntryIndexes = []; // List of all entry indexes currently being shown. Entries are displayed in the order of this list.
var EntryData = []; // List of all entries in order of how they've been added. Should not be sorted, only added to.

var CurrentSortingMode;

const SortingModes = {
    ALPHABETICAL: 0,
    DATEADDED: 1
}

// Dom elements
const libraryContainer = document.getElementById('libraryContainer');
const libraryEntryList = document.getElementById('libraryEntryList');
const displayContainer = document.getElementById('displayContainer');
const imageDisplay = document.getElementById('imageDisplay');
var entryElements = Array.from(document.getElementsByClassName('entry'));

// Events
libraryContainer.addEventListener('dragover', (event) => OnLibraryDragOver(event));
displayContainer.addEventListener('dragover', (event) => OnDisplayDragOver(event));
libraryContainer.addEventListener('drop', (event) => OnImageDropped(event));

entryElements.forEach(entry => {
    let src = entry.getElementsByTagName('img')[0].src;
    entry.addEventListener('click', (event) => OnSelectEntry(event, src));
});
libraryContainer.addEventListener('click', (event) => OnEntryDeselected(event));


// Event functions
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
        AddEntry(files[0]);  
    }
}

function OnSelectEntry(event, imageID){
    event.stopPropagation();
    SelectEntry(imageID)
}

function OnEntryDeselected(event){
    DeselectEntry();
}


// Main functions
function AddEntry(image){
    if (image == null || !image.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let src = event.target.result;
        EntryData.push({
            src: src
        })

        CreateDOMEntry(EntryData.length - 1);
        SelectEntry(EntryData.length - 1);
    };
    reader.readAsDataURL(image);
}
 
function AddImageSet(images){
    Array.from(images).forEach((image) => AddEntry(image));
}

function CreateDOMEntry(entryID){
    let newEntry = document.createElement('li');
    newEntry.classList.add('entry');
    newEntry.entryID = entryID;

    let newEntryThumbnailContainer = document.createElement('div');
    newEntryThumbnailContainer.classList.add('entryThumbnailContainer');

    let newEntryThumbnail = document.createElement('img');
    newEntryThumbnail.classList.add('entryThumbnail');
    newEntryThumbnail.src = EntryData[entryID].src;

    newEntryThumbnailContainer.appendChild(newEntryThumbnail);
    newEntry.appendChild(newEntryThumbnailContainer);

    libraryEntryList.appendChild(newEntry);

    newEntry.addEventListener('click', (event) => OnSelectEntry(event, entryID))
}

function SelectEntry(entryID){
    let entry = EntryData[entryID];
    if(entry == null || entry.src == null){
        DeselectEntry()
        return;
    }

    imageDisplay.src = entry.src;
}

function DeselectEntry(){
    SelectedEntryIndex = null;
    imageDisplay.src = "";
}

function GetSelectedEntry() {
    return EntryData[SelectedEntryIndex];
}