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
libraryContainer.addEventListener('dragover', OnLibraryDragOver);
displayContainer.addEventListener('dragover', OnDisplayDragOver);
libraryContainer.addEventListener('drop', OnImageDropped);

libraryContainer.addEventListener('click', OnEntryDeselected);

document.addEventListener('keydown', KeyPressedLibrary)

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

function OnEntryDeselected(){
    DeselectEntry();
}

function KeyPressedLibrary(event){
    console.log("Que");
    if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if(SelectedEntryIndex == 0) SelectEntry(EntryData.length - 1);
        else SelectEntry(SelectedEntryIndex - 1);
    } 
    else if (event.key === 'ArrowRight') {
        event.preventDefault();
        if(SelectedEntryIndex == EntryData.length - 1) SelectEntry(0);
        else SelectEntry(SelectedEntryIndex + 1);
    }
};


// Main functions
function AddEntry(input){
    if (input == null || !input.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        let src = event.target.result;
        let id = EntryData.length;

        EntryData.push({
            src: src
        })
        
        EntryData[id].html = CreateDOMEntry(id)
        SelectEntry(id);
    };
    reader.readAsDataURL(input);
}
 
function AddImageSet(input){
    Array.from(input).forEach(AddEntry);
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

    newEntry.addEventListener('click', (event) => OnSelectEntry(event, entryID));

    return newEntry;
}

function SelectEntry(entryID){
    DeselectEntry();

    let entry = EntryData[entryID];
    if(entry == null || entry.src == null){
        DeselectEntry()
        return;
    }

    SelectedEntryIndex = entryID;
    imageDisplay.src = entry.src;

    entry.html.id = "selectedEntry";
}

function DeselectEntry(){
    if(SelectedEntryIndex == null) return;

    SelectedEntry().html.id = "";
    SelectedEntryIndex = null;
    imageDisplay.src = "";
}

function SelectedEntry(){
    return EntryData[SelectedEntryIndex];
}