// Vars
let SelectedId; // The Id of the selected entry.
let Entries = []; // All current entries within the database. Populated on window load.

let MultiSelectedIds = [];


// Dom elements
const libraryContainer = document.getElementById('libraryContainer');
const libraryEntryList = document.getElementById('libraryEntryList');
const displayContainer = document.getElementById('displayContainer');
const imageDisplay = document.getElementById('imageDisplay');
const nameDisplay = document.getElementById('nameDisplay');
const tagPanel = document.getElementById('tagPanel');
const tagList = document.getElementById('tagList');
const tagInput = document.getElementById('tagInput');

// Events
libraryContainer.addEventListener('dragover', OnLibraryDragOver);
displayContainer.addEventListener('dragover', OnDisplayDragOver);
libraryContainer.addEventListener('drop', OnImageDropped);

libraryContainer.addEventListener('click', OnEntryDeselected);

nameDisplay.addEventListener('change', OnSetName);
tagInput.addEventListener('change', OnAddTag);

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
    SelectEntry(id, event.shiftKey, event.ctrlKey)
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
            if(SelectedId != null) RemoveEntry(SelectedId);
            else MultiSelectedIds.forEach((id) => RemoveEntry(id));
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
    
    const name = event.target.value;
    entry = SelectedEntry();

    entry.name = name;
    entry.html.querySelector('.entryName').innerHTML = name;

    window.api.setName(SelectedId, name);
}

function OnAddTag(event){
    if(SelectedId == null){
        return;
    }

    const tagName = event.target.value;
    if(tagName == null || tagName == "") return;

    tagInput.value = "";
    AddTag(tagName);
}


// Main functions
function GetEntry(id){
    return Entries.find((entry) => entry.id === id);
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
    DeselectEntry();

    const entry = GetEntry(entryId);
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

    let newEntryPropertyContainer = document.createElement('div');
    newEntryPropertyContainer.classList.add('entryPropertiesContainer');

    let newEntryName = document.createElement('p');
    newEntryName.classList.add('entryName');
    if(entry.name != null) newEntryName.innerHTML = entry.name;

    newEntryThumbnailContainer.appendChild(newEntryThumbnail);
    newEntryPropertyContainer.appendChild(newEntryName);
    newEntry.appendChild(newEntryThumbnailContainer);
    newEntry.appendChild(newEntryPropertyContainer);

    libraryEntryList.appendChild(newEntry);

    newEntry.addEventListener('click', (event) => OnSelectEntry(event, id));

    entry.html = newEntry;
}

function SelectEntry(id, shiftKeyHeld = false, ctrlKeyHeld = false){
    if(id == SelectedId) return;

    if(shiftKeyHeld){
        SweepSelect(id, ctrlKeyHeld);
        return;
    }

    if(ctrlKeyHeld){
        SelectMultiEntry(id);
        return;
    }

    DeselectEntry();

    const entry = GetEntry(id);
    if(entry == null) return;

    SelectedId = id;
    imageDisplay.src = entry.path;
    nameDisplay.disabled = false;
    tagPanel.style.display = "block";
    if(entry.name != null){}
    nameDisplay.value = entry.name != null ? entry.name : "";
    nameDisplay.placeholder = entry.name != null ? "" : "unnamed";
    HighlightEntry(id);
    DisplayTags(id);
}

function SelectMultiEntry(id){
    if(SelectedId == id) return;
    if(GetEntry(id) == null) return;

    if(SelectedId == null && MultiSelectedIds.length == 0){
        SelectEntry(id);
        return;
    }

    EnterMultiSelectMode();

    if(MultiSelectedIds.includes(id)){
        DeselectMultiEntry(id);
    }

    MultiSelectedIds.push(id);
    HighlightEntry(id);
}

function DeselectMultiEntry(id){
    if(MultiSelectedIds.length == 0) return;
    if(GetEntry(id) == null) return;

    MultiSelectedIds.splice(MultiSelectedIds.indexOf(id), 1);
    UnHighlightEntry(id);

    ExitMultiSelectMode();
}

function EnterMultiSelectMode(){
    if(MultiSelectedIds.length == 0){
        MultiSelectedIds.push(SelectedId);
        SelectedId = null;
        ResetDisplayContainer();
    }
}

function ExitMultiSelectMode(){
    if(MultiSelectedIds.length == 1){
        const lastId = MultiSelectedIds[0];
        MultiSelectedIds = [];
        SelectEntry(lastId);
    }
}

function SweepSelect(id, ctrlKeyHeld = false){
    if(MultiSelectedIds.length > 1){
        let lastSelectedEntryId = MultiSelectedIds[MultiSelectedIds.length - 1];
        DeselectEntry();
        SelectEntry(lastSelectedEntryId)
        SelectEntry(id, true, false)
        return;
    }
    else if(SelectedId != null){
        let selectedEntryIndex = Entries.indexOf(SelectedEntry());
        let newEntryIndex = Entries.indexOf(GetEntry(id));
        let indexDif = newEntryIndex - selectedEntryIndex;
        if(indexDif > 0){
            for(let i = selectedEntryIndex + 1; i <= newEntryIndex; i++) {
                SelectMultiEntry(Entries[i].id);
            }
        }
        else{
            for(let i = selectedEntryIndex - 1; i >= newEntryIndex; i--) {
                SelectMultiEntry(Entries[i].id);
            }
        }
        return;
    }
    SelectEntry(id, false, ctrlKeyHeld)
}

function SelectNextEntry(){
    const entryIndex = Entries.indexOf(SelectedId);

    if(entryIndex == Entries.length - 1) SelectEntry(Entries[0].id);
    else SelectEntry(Entries[entryIndex + 1].id);
}

function SelectPreviousEntry(){
    const entryIndex = Entries.indexOf(SelectedId);
    
    if(entryIndex == 0) SelectEntry(Entries[Entries.length - 1].id);
    else SelectEntry(Entries[entryIndex - 1].id);
}

function DeselectEntry(){
    ResetDisplayContainer();

    if(MultiSelectedIds.length > 0){
        MultiSelectedIds.forEach((id) => UnHighlightEntry(id));
        MultiSelectedIds = [];
    } 

    if(SelectedId == null) return;
    UnHighlightEntry(SelectedId);
    SelectedId = null;
}

function ResetDisplayContainer(){
    imageDisplay.src = "";
    nameDisplay.value = "";
    nameDisplay.placeholder = "";
    nameDisplay.disabled = true;
    tagPanel.style.display = "none";
    tagInput.value = "";
    ClearDOMags();
}

function HighlightEntry(id){
    const entry = GetEntry(id);
    if(entry == null) return;
    entry.html.classList.add("selectedEntry");
}

function UnHighlightEntry(id){
    const entry = GetEntry(id);
    if(entry == null) return;
    entry.html.classList.remove("selectedEntry");
}

async function DisplayTags(entryId){
    const tags = await window.api.getTags(entryId);
    if(tags == null) return;
    tags.forEach(AddDOMTag);
}

async function AddTag(tagName){
    const newTag = await window.api.addTag(SelectedId, tagName);

    AddDOMTag(newTag);
}

function AddDOMTag(tag){
    const newTag = document.createElement('li');
    newTag.classList.add('tag');
    newTag.innerHTML = tag.name;
    newTag.addEventListener('contextmenu', (event) => RemoveTag(event, tag));

    tagInput.before(newTag);
}

async function RemoveTag(event, tag){
    await window.api.removeTag(SelectedId, tag.id);
    event.target.remove();
}

function ClearDOMags(){
    while(true){
        if(tagList.firstChild === tagInput) return;
        tagList.firstChild.remove();
    }
}