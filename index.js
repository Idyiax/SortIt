// Vars
let SelectedId; // The Id of the selected entry.
let Entries = []; // All current entries within the database. Populated on window load.


// Dom elements
const libraryContainer = document.getElementById('libraryContainer');
const libraryEntryList = document.getElementById('libraryEntryList');
const displayContainer = document.getElementById('displayContainer');
const imageDisplay = document.getElementById('imageDisplay');
const nameDisplay = document.getElementById('nameDisplay');

// Events
libraryContainer.addEventListener('dragover', OnLibraryDragOver);
displayContainer.addEventListener('dragover', OnDisplayDragOver);
libraryContainer.addEventListener('drop', OnImageDropped);

libraryContainer.addEventListener('click', OnEntryDeselected);

nameDisplay.addEventListener('change', OnSetName);

document.addEventListener('keydown', OnLibraryKeyPressed);

window.addEventListener('load', OnLoad);

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

function OnSelectEntry(event, id){
    event.stopPropagation();
    SelectEntry(id)
}


function OnEntryDeselected(){
    DeselectEntry();
}

function OnLibraryKeyPressed(event){
    switch(event.key){
        case('ArrowLeft'):
            event.preventDefault();
            SelectPreviousEntry();
            break;
        case('ArrowRight'):
            event.preventDefault();
            SelectNextEntry();
            break;
        case('Delete'):
            event.preventDefault();
            RemoveEntry(SelectedId);
            break;
    }
}

async function OnLoad(){
    Entries = await window.api.getImages();
    Entries.forEach((entry) => {
        CreateDOMEntry(entry.id);
    })
}

function OnSetName(event){
    if(SelectedId == null){
        nameDisplay.value = "";
        return;
    }
    
    let name = event.target.value;
    SelectedEntry().name = name;
    window.api.setName(SelectedId, name);
}


// Main functions
function GetEntry(entryId){
    return Entries.find((entry) => entry.id === entryId);
}

function SelectedEntry(){
    return GetEntry(SelectedId);
}

function AddEntry(input){
    if (input == null || !input.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.readAsDataURL(input);
    reader.onload = async function(event) {
        let src = event.target.result;

        const newEntry = await window.api.addImage({
                src: src,
                type: input.type
            })
        
        if(newEntry != null) Entries.push(newEntry);

        CreateDOMEntry(newEntry.id)
        SelectEntry(newEntry.id);
    };
}
 
function AddImageSet(input){
    Array.from(input).forEach(AddEntry);
}

function RemoveEntry(entryId){
    if(SelectedId == entryId) DeselectEntry();

    let entry = GetEntry(entryId);
    entry.html.remove()

    window.api.removeImage(entryId);

    Entries.splice(Entries.indexOf(entry), 1);
}

function CreateDOMEntry(id){
    let entry = GetEntry(id);

    let newEntry = document.createElement('li');
    newEntry.classList.add('entry');

    let newEntryThumbnailContainer = document.createElement('div');
    newEntryThumbnailContainer.classList.add('entryThumbnailContainer');

    let newEntryThumbnail = document.createElement('img');
    newEntryThumbnail.classList.add('entryThumbnail');
    newEntryThumbnail.src = entry.path;

    //let newEntryName = document.createElement('div');
    //newEntryName.innerHTML = "test";

    newEntryThumbnailContainer.appendChild(newEntryThumbnail);
    //newEntryThumbnailContainer.appendChild(newEntryName);
    newEntry.appendChild(newEntryThumbnailContainer);

    libraryEntryList.appendChild(newEntry);

    newEntry.addEventListener('click', (event) => OnSelectEntry(event, id));

    entry.html = newEntry;
}

function SelectEntry(id){
    DeselectEntry();

    let entry = GetEntry(id);
    if(entry == null || entry.path == null){
        DeselectEntry()
        return;
    }

    SelectedId = id;
    imageDisplay.src = entry.path;
    nameDisplay.value = entry.name != null ? entry.name: "";
    entry.html.id = "selectedEntry";
}

function SelectNextEntry(){
    let entryIndex = Entries.findIndex((entry) => entry.id === SelectedId);

    if(entryIndex == Entries.length - 1) SelectEntry(Entries[0].id);
    else SelectEntry(Entries[entryIndex + 1].id);
}

function SelectPreviousEntry(){
    let entryIndex = Entries.findIndex((entry) => entry.id === SelectedId);
    
    if(entryIndex == 0) SelectEntry(Entries[Entries.length - 1].id);
    else SelectEntry(Entries[entryIndex - 1].id);
}

function DeselectEntry(){
    if(SelectedId == null) return;

    SelectedEntry().html.id = "";
    SelectedId = null;
    imageDisplay.src = "";
    nameDisplay.value = "";
}