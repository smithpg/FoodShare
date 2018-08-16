function slideOut(elem, duration){
    elem.style.transition = "all " + duration + "ms";
    elem.style.opacity = 0;
    elem.style.height = 0;

    setTimeout(()=>{
        elem.remove();
    }, duration);
}

function removePantryItem(elem){
    var itemToDelete = Number(elem.getAttribute("buttonItem"));

    console.log("Trying to delete item w/ id ", itemToDelete);
    //help with delete from: https://stackoverflow.com/questions/46497137/dexie-js-table-deleteid-not-working-for-per-row-deletion
    db.foodItems.where(":id").equals(itemToDelete).delete()
        .then(()=>{
            slideOut(elem.parentNode, 200);
        });    
}

function formatDate(unformattedDate){
    let splitDate = unformattedDate.split("-");
    return `${splitDate[1].replace(/^0/, "")}-${splitDate[2].replace(/^0/, "")}-${splitDate[0].slice(2)}`;
}

function expirationCheck(item){
    var today = new Date();
    var expirationtime= new Date(item.expoDate);
    let daystoExpiration = Math.abs(today.gettime()-expirationtime.gettime()); 
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
    alert(diffDays);
    //should then write a loop to go through all the foods in pantry and print it 
}


function putWrapper(param){
    console.log("put called with param:");
    console.dir(param);

    return  db.foodItems.put(param);
}


/*
* this function adds a food item to the indexedDB
* It is fired when the "submit" buton is hit and then it takes
* the values in teh boxes and saves them.
*/
function addFoodItem(name, expoDate){
    
    // db.foodItems.put({name: name, expoDate: expoDate}).then(function(id){
    //     return db.foodItems.get(id);
    // }).then(function (foodItem){
    //     //after adding item, adding to display
    //     createPantryItem(foodItem);
    // }).catch(function(error) {
    //     alert ("Ooops: " + error);
    // });  
    putWrapper({name: name, expoDate: expoDate}).then(function(id){
        return db.foodItems.get(id);
    }).then(function (foodItem){
        //after adding item, adding to display
        createPantryItem(foodItem);
    }).catch(function(error) {
        alert ("Ooops: " + error);
    });  
}

function createPantryItem(item){
    console.dir(item);
    
    newElement = document.createElement("div");
    newElement.textContent = item.name;

    if(item.expoDate != "")
    {    
        var expoDateSpan = document.createElement("span");
        expoDateSpan.classList.add("expoDate");
        expoDateSpan.textContent = formatDate(item.expoDate);
        newElement.appendChild(expoDateSpan);
    }
    var deleteButton = document.createElement("button");
    deleteButton.classList.add("delete");
    deleteButton.textContent = "X";
    deleteButton.setAttribute("buttonItem", item.id); //this attribute of the button holds the id of the food item it represents so it can be easily deleted
    newElement.appendChild(deleteButton);

    pantryItemDisplay.appendChild(newElement);

    console.log("returning", newElement);
    return newElement;
}

function displayPantry(){
    /*
    For each item in DB
    make flex box
    and put in flex container
    */

    pantryItemDisplay.innerHTML = "";

    let newElement;
    db.foodItems.each(item => {
        console.log("in display each loop");
        createPantryItem(item);
    })  
}

// DOM Selections
var addButtonItem = document.getElementById("addButton");
var popUp = document.getElementById("addItemPopup");
var submitButton = document.getElementById("submitButton");
const pantryItemDisplay = document.getElementById("pantryItemDisplay");
const navOptions = document.querySelectorAll("nav div");

// Event Listeners
navOptions.forEach(elem => {
    addEventListener("click", function(event){
        
    });
});

addButtonItem.addEventListener("click", function(event){
   popUp.style.visibility = "visible";
});

submitButton.addEventListener("click", function(event){
    console.log("clickin'");
    
    var foodInput = document.getElementById("foodName"),
        expoDate = document.getElementById("expoDate");
    
    if(foodInput.value == "") return; //not allowing blank items
    popUp.style.visibility = "hidden";
    addFoodItem(foodInput.value, expoDate.value);
});

// This event listener is on the whole pantry div
// When anywhere on the pantry is clicked, this gets triggered. 
// It then checks the id of what actually fired, and 
// if it was a delete button, then it will delete that item from the DB
pantryItemDisplay.addEventListener('click', function(event){
    if(event.target.classList.contains("delete"))
    {
        removePantryItem(event.target);
    }
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
             .register('/service-worker.js')
             .then(function() { console.log('Service Worker Registered'); });
}


// Define the database
const db = new Dexie("foodshare_database");
db.version(1).stores({
    foodItems: 'id++,name,expoDate'
});

// Display the current pantry
displayPantry();