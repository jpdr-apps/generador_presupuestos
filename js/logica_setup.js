var persistence = {};
var currentFileHandle ;

const fileSheets = {};
var selectedSheets = {};
var fileName;
var workbook = {};

var profile = {};
/*
var profile = {    
    key: undefined,
    data: {
        fileHandle: undefined,
        businessLogo: undefined,
        businessInfo : [undefined,undefined,undefined,undefined,undefined],
        fileSheets: {            
        }   

    }    
        
}
*/

/*

fileSheets : {
    Sheet1 : {
        description: "A",
        price: "C",
        titlesRow: 1
    }
}

*/

window.onload = () => {

    persistence = new Persistence("MiPresupuestoDB");

    if (!persistence.isEnabled())
        return;

    windowOnLoad();
 
};

document.getElementById("formStep2ButtonAgregar").addEventListener("click", (e) => {    
    const select = document.getElementById("formStep2LeftSheets");
    if (select.options[select.selectedIndex] !== undefined){
        swapSelectedOption("formStep2LeftSheets", "formStep2RightSheets");    
        checkButton("formStep2ButtonAgregar");
        checkButton("formStep2ButtonConfirmar");
    }    
    e.preventDefault();
});

document.getElementById("formStep2ButtonQuitar").addEventListener("click", (e) => {
    const select = document.getElementById("formStep2RightSheets");
    if (select.options[select.selectedIndex] !== undefined){
        swapSelectedOption("formStep2RightSheets", "formStep2LeftSheets");    
        checkButton("formStep2ButtonQuitar");
        checkButton("formStep2ButtonConfirmar");
    }
    e.preventDefault();
}); 


document.getElementById("formStep2ButtonConfirmar").addEventListener("click", (e) => {    

    
    copyAllOptions("formStep2RightSheets", "formStep3Sheets");
        
    e.preventDefault();
});


document.getElementById("formStep3Sheets").addEventListener("click", (e) => {

    removeAllChildNodes("formStep3DescColumns");
    removeAllChildNodes("formStep3PriceColumns");
    removeAllChildNodes("formStep3TitlesRow");

    const sheet = workbook.Sheets[e.target.value];             
    const range = sheet['!ref'];
    const rangeData = getRangeData(range);
    
    for ( var i = rangeData.firstColumn.charCodeAt(0) ; i <= rangeData.lastColumn.charCodeAt(0)  ; i++){                                        
            const column = String.fromCharCode(i)
            addOption("formStep3DescColumns",column,column);
            addOption("formStep3PriceColumns",column,column);
    };

    for ( var i = rangeData.firstRow ; i <= rangeData.lastRow; i++)
        addOption("formStep3TitlesRow",i,i);

    e.preventDefault();

});


document.getElementById("formStep3DescColumns").addEventListener("click", (e) => {
    const select = document.getElementById("formStep3DescColumns");    
    if ( 'currentSelection' in select.dataset ){
        enableOption("formStep3PriceColumns", select.dataset.currentSelection);        
    };
    const value = e.target.value;
    select.dataset.currentSelection = value;
    disableOption("formStep3PriceColumns", value);        
    checkButton("formStep3ButtonConfirmar");
    e.preventDefault();
});


document.getElementById("formStep3PriceColumns").addEventListener("click", (e) => {
    const select = document.getElementById("formStep3PriceColumns");    
    if ( 'currentSelection' in select.dataset ){
        enableOption("formStep3DescColumns", select.dataset.currentSelection);        
    };
    const value = e.target.value;
    select.dataset.currentSelection = value;
    disableOption("formStep3DescColumns", value);        
    checkButton("formStep3ButtonConfirmar");
    e.preventDefault();
});


document.getElementById("formStep3TitlesRow").addEventListener("click", (e) => {
    const select = document.getElementById("formStep3TitlesRow");    
    const value = e.target.value;
    select.dataset.currentSelection = value;
    checkButton("formStep3ButtonConfirmar");
    e.preventDefault();
});


document.getElementById("formStep3ButtonConfirmar").addEventListener("click", (e)=> {

    try {
    var select = document.getElementById("formStep3Sheets");
    if (select.selectedIndex >= 0){
       
        var option = select.options[select.selectedIndex];
        removeOption("formStep3Sheets", option.innerText);
       
        
        removeAllChildNodes("formStep3Data");
        selectedSheets[option.innerText] = {};
        selectedSheets[option.innerText].description = document.getElementById("formStep3DescColumns").value;
        selectedSheets[option.innerText].price = document.getElementById("formStep3PriceColumns").value;
        selectedSheets[option.innerText].titlesRow = document.getElementById("formStep3TitlesRow").value;           

        removeAllChildNodes("formStep3DescColumns");
        removeAllChildNodes("formStep3PriceColumns");
        removeAllChildNodes("formStep3TitlesRow");

       select = document.getElementById("formStep3Data");
       

        for ( const[key, value] of Object.entries(selectedSheets) ){                
                const newOption = document.createElement("option");
                newOption.value = key;
                newOption.innerText = "HOJA '"+key+"' [ DESCRIPCIÓN : COLUMNA '"+ value.description + "' - PRECIO UNITARIO : COLUMNA '" + value.price +"' - FILA DE TITULOS : "+ value.titlesRow +"]";                
                select.appendChild(newOption);

        }
        

    }
    
    }catch(error){
        console.log(error);
    }

    
    checkButton("formStep3ButtonConfirmar");
    checkButton("formStep4Submit");

    e.preventDefault();

});


document.getElementById("formStep3Data").addEventListener("click", (e)=> {

    var select = document.getElementById("formStep3Data");
    checkButton("formStep3ButtonRevertir");

    e.preventDefault();

});


document.getElementById("formStep3Data").addEventListener("focusout", (e)=> {

    checkButton("formStep3ButtonRevertir");

    e.preventDefault();

});


document.getElementById("formStep3ButtonRevertir").addEventListener("click", (e)=> {

    var select = document.getElementById("formStep3Data");
    if (select.selectedIndex >= 0){
        const option = select.options[select.selectedIndex];
        const value = option.value;
        
        addOption("formStep3Sheets", value, value);
        removeOption("formStep3Data", option.innerText);
        sortOptions("formStep3Sheets");
        delete selectedSheets[value];
       /* selectedSheets[value] = ({            
            //isDefined: false,
            description: undefined,
            price: undefined,
            titlesRow: undefined                
        });*/
    }

    checkButton("formStep3ButtonRevertir");
    checkButton("formStep4Submit");
 
    e.preventDefault();
});


document.getElementById("formStep4Submit").addEventListener("click", (e) => {

    e.preventDefault();

    profile.data.fileSheets = selectedSheets;        
    
    persistence.set(profile)
    .then( () => {    
        persistence.set({ key: "configuracion", data: { currentFileHandle: currentFileHandle } })
        document.getElementById("formProfile").submit();
    }) 
    .catch( (error) => {console.log(error)});        

});


document.getElementById("formStep4Cancel").addEventListener("click", (e) => {

    e.preventDefault();    
    document.getElementById("formProfile").submit();

});






































/// EVENT HANDLERS ///

function windowOnLoad(){

    feather.replace();
       
    persistence.get("configuracion")
        .then ( (data) => {                             
            if (data === undefined){
                console.log("Error en la pagina. Deberia estar definido el currentFileHandle.");                
            }else{                     
                currentFileHandle = data.data.currentFileHandle ;
                document.getElementById("formStep1Label").innerText = currentFileHandle.name;
                removeAllChildNodes("formStep2LeftSheets");
                removeAllChildNodes("formStep2RightSheets");
                checkButton("formStep2ButtonAgregar");
                checkButton("formStep2ButtonQuitar");
                checkButton("formStep2ButtonConfirmar");
                checkButton("formStep3ButtonConfirmar");
                checkButton("formStep3ButtonRevertir");
                
                persistence.get(currentFileHandle.name)
                .then((data)=> {
                    if (data === undefined){
                        //console.log("Error: No se encontro perfil");                         
                        profile.key = currentFileHandle.name;
                        profile.data = {};
                        profile.data.fileHandle = currentFileHandle;

                    }else{             
                        profile = data;                                                              
                    }

                })
                .catch( (error) => console.log(error));
                            
                //document.getElementById("formButtonInfoEmpresa").setAttribute("disabled", "disabled");

                fileChangeHandler(currentFileHandle);
            };                                
        }) 
        .catch ( (error) => console.log(error));




};






















































/// FUNCIONES AUXILIARES ///

function getRangeData(range) {

    const firstCellIndex = range.match(/[0-9]+/).index;
    const colonIndex = range.match(":").index;
    const lastCellIndex = colonIndex + range.substring(colonIndex).match(/[0-9]+/).index;

    return {
        firstColumn: range.substring(0,firstCellIndex),
        firstRow: range.substring(firstCellIndex,colonIndex),        
        lastColumn: range.substring(colonIndex+1,lastCellIndex),
        lastRow: range.substring(lastCellIndex)
    }

};













































function fileChangeHandler(file){

    if (!file)
        return;
    
    fileName = file.name;

    var reader = new FileReader();
    reader.onload = function(e) {
        var contents = e.target.result;        
        workbook = XLSX.readFile(contents, {dense: true}/*{sheetRows: 1}*/);                        

        workbook.SheetNames.forEach( (name) => {              
            addOption("formStep2LeftSheets",name,name); 
        });   

        checkButton("formStep2ButtonAgregar");    

    };
    
    reader.readAsArrayBuffer(file);
    
    /*Object.keys(testSheets).forEach( (key) =>  {
/*        addOption("formStep2LeftSheets",key,key);        
    /*});
    checkButton("formStep2ButtonAgregar");    
    */
};

function addOption(parentStringId, value, text){
    const option = document.createElement("option");    
    option.attributes.value = value;
    option.innerText = text;    
    document.getElementById(parentStringId).appendChild(option);
    
};

function removeOption(parentStringId, value){

    const parent = document.getElementById(parentStringId);    
    var childToRemove ;
    parent.childNodes.forEach ( (child) => {
        if (child.innerText == value)
            childToRemove = child;
    });    
    
    if (childToRemove !== undefined){
        parent.removeChild(childToRemove);
        sortOptions(parentStringId);
    }
};

function disableOption(parentStringId, value){

    const parent = document.getElementById(parentStringId); 
    
    parent.childNodes.forEach ( (child) => {
        if (child.value == value)            
            child.setAttribute("disabled", "disabled");
    });  

};

function enableOption(parentStringId, value){

    const parent = document.getElementById(parentStringId); 
    
    parent.childNodes.forEach ( (child) => {
        if (child.value == value)            
            child.removeAttribute("disabled");
    });  

};



function swapSelectedOption(originParentStringId, targetParentStringId){
    const originSelect = document.getElementById(originParentStringId);
    const option = originSelect.options[originSelect.selectedIndex];
    const newNode = option.cloneNode(true);
    const targetSelect = document.getElementById(targetParentStringId);
    originSelect.removeChild(option);
    targetSelect.appendChild(newNode);
    sortOptions(originParentStringId);
    sortOptions(targetParentStringId);
    checkButton("formStep2ButtonAgregar");
    checkButton("formStep2ButtonQuitar");
};

function copyAllOptions(originParentStringId, targetParentStringId){
    const originSelect = document.getElementById(originParentStringId);    
    const targetSelect = document.getElementById(targetParentStringId);
    removeAllChildNodes(targetParentStringId);
    selectedSheets = {};

    for (var i = 0; i < originSelect.options.length ; i++){
        const newOption = originSelect.options[i].cloneNode(true);
        targetSelect.appendChild(newOption);
        /*
        selectedSheets[newOption.innerText] = ({            
            //isDefined: false,
            description: undefined,
            price: undefined,
            titlesRow: undefined 
            
        });
        */
    }

    //console.log(selectedSheets);
    
};


function sortOptions(parentStringId){

    const select = document.getElementById(parentStringId);
    const oldList = select.childNodes;
    const newList = [];

    oldList.forEach ( (item) => {
        newList.push( item );
    });
    
    newList.sort((a,b)=>{
        return a.value == b.value? 0 : ( a.value > b.value ? 1 : -1 );

    });

    for (i = 0; i < newList.length; ++i) {
        select.appendChild(newList[i]);
    }

};


function removeAllChildNodes(parentStringId) {

    const parent = document.getElementById(parentStringId);

    while (parent.firstChild) {        
        parent.removeChild(parent.firstChild);
    }    

    if ( 'currentSelection' in parent.dataset )
        delete parent.dataset.currentSelection;
};


function checkButton(buttonStringId){

    const button = document.getElementById(buttonStringId);
    var disable = false;

    switch (buttonStringId){

        case "formStep2ButtonAgregar" : {
            if ( document.getElementById("formStep2LeftSheets").childNodes.length == 0 )
                disable = true;                            
            break;
        };

        case "formStep2ButtonQuitar" : {
            if ( document.getElementById("formStep2RightSheets").childNodes.length == 0 )
                disable = true;
            break;
        };

        case "formStep2ButtonConfirmar" : {
            if ( document.getElementById("formStep2RightSheets").childNodes.length == 0 )
                disable = true;
            break;
        };

        case "formStep3ButtonConfirmar" : {
            const selectDesc = document.getElementById("formStep3DescColumns");
            const selectPrice = document.getElementById("formStep3PriceColumns");
            const selectTitlesRow = document.getElementById("formStep3TitlesRow");
            
            if ( 
                !('currentSelection' in selectDesc.dataset) || 
                !('currentSelection' in selectPrice.dataset) || 
                !('currentSelection' in selectTitlesRow.dataset) ||
                selectDesc.dataset.currentSelection == '' || 
                selectPrice.dataset.currentSelection == ''  ||   
                selectTitlesRow.dataset.currentSelection == ''         
            ){            
                disable = true;
            }
            
            break;
        };

        case "formStep3ButtonRevertir": {
            
            if ( document.activeElement !== document.getElementById("formStep3Data") &&
                document.getElementById("formStep3Data").selectedIndex < 0){                
                disable = true;
            }
            
            break;
        };

        case "formStep4Submit" : {

            if ( document.getElementById("formStep3Data").length < 1) {                
                disable = true;
            }

            break;
        };

        
    }

    if (disable){
        button.setAttribute("disabled","disabled");                
    }else{    
        button.removeAttribute("disabled");
    }

};