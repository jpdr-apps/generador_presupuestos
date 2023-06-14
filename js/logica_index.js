var currentFileHandle;
var persistence;
var profile = {};
var productData = [];

const maxProducts = 20;


const xlsPickerOpts = {
    types: [
      {
        description: "Archivos de Excel",
        accept: {
          "excel/*": [".xlsx", ".xls"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

const imgPickerOpts = {
    types: [
      {
        description: "Imágenes",
        accept: {
          "image/*": [".png", ".gif", ".jpeg", ".jpg"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };

/*
var profiles = {
    key: filename,
    data: {
        fileHandle: file,
        businessLogo: imagedata,
        businessInfo : [],
        fileSheets: {
            "Sheet1" : {
                columns: {                
                    description: "",
                    price: ""
                }
            }
        },
        businessInfoFooter: [] 
    }    
        
}
*/


/// EVENTOS ///

window.onload = async () => {
        

        persistence = new Persistence("MiPresupuestoDB");

        if (!persistence.isEnabled())
            return;
        
        windowOnLoad();            

};


window.onbeforeunload = () => {
    window.scrollTo(0, 0);
};


document.getElementById("buttonAbrirPlanilla").addEventListener("click", async (e) => {
    
    buttonAbrirPlanillaOnClick()
    e.preventDefault();    

});


document.getElementById("formButtonConfigurarPlanilla").addEventListener("click", (e) => {

    //document.getElementById("hiddenModalButton").click();

});


document.getElementById("buttonGenerarPDF").addEventListener("click", (e) => {
    generarPDF();
});


document.getElementById("formLogo").addEventListener("click" , async (e) => {

    formLogoOnClick();
    e.preventDefault();

});


document.getElementById("formInfo1").addEventListener("keyup",(e) => {
    
    formInfoOnClick(e,0,true);
    e.preventDefault();    
});


document.getElementById("formInfo2").addEventListener("keyup",(e) => {
    
    formInfoOnClick(e,1,true);
    e.preventDefault();  
});


document.getElementById("formInfo3").addEventListener("keyup",(e) => {
    
    formInfoOnClick(e,2,true);
    e.preventDefault();  
});        


document.getElementById("formInfo4").addEventListener("keyup",(e) => {
    
    formInfoOnClick(e,3,true);
    e.preventDefault();  

});      


document.getElementById("formInfo5").addEventListener("keyup",(e) => {

    formInfoOnClick(e,4,true);
    e.preventDefault();  

});  

document.getElementById("docFooter1").addEventListener("keyup",(e) => {
   
    formInfoOnClick(e,0, false);
    e.preventDefault();  

});

document.getElementById("docFooter2").addEventListener("keyup",(e) => {

    formInfoOnClick(e,1, false);
    e.preventDefault();  

});

document.getElementById("docFooter3").addEventListener("keyup",(e) => {

    formInfoOnClick(e,2, false);
    e.preventDefault();  

});


document.getElementById("formButtonGuardarInfo").addEventListener("click", (e) => {        
    
    persistence.set(profile);        
    document.getElementById("formButtonGuardarInfo").setAttribute("disabled", "disabled");
    e.preventDefault();
});



































/// EVENT HANDLERS ///


function windowOnLoad(){

    feather.replace(); 

    const param = new URLSearchParams(window.location.search).get('redirected');
   
    if ( param === 'true' ){
        persistence.get("configuracion")
        .then( (configuracion) => {
                        
            currentFileHandle = configuracion.data.currentFileHandle;
            
            console.log(currentFileHandle);

            productData = [];
            profile = [];

            document.getElementById("menuSidebarFileName").value = "";
            document.getElementById("menuSidebarFileDate").value = "";                
            document.getElementById("menuSidebarProductCount").value = ""; 
            document.getElementById("content-to-print").style.display = "none";
            document.getElementById("formButtonGuardarInfo").setAttribute("disabled", "disabled");
            document.getElementById("buttonGenerarPDF").setAttribute("disabled", "disabled");

            loadXls();  

        })
        .catch( (error) => {console.log(error) } );        

    }else{    
    
        document.getElementById("content-to-print").style.display = "none";
        document.getElementById("formButtonGuardarInfo").setAttribute("disabled", "disabled");
        document.getElementById("buttonGenerarPDF").setAttribute("disabled", "disabled");

        document.getElementById("content-to-print-empty-message").style.display = "flex";
        document.getElementById("content-to-print-empty-message-text").innerHTML = "Para comenzar, hacer click en el botón <span style='color: #0d6efd;'>'Cargar planilla de precios'</span>.";
    
    }
    window.scrollTo(0, 0);
};


async function buttonAbrirPlanillaOnClick() {
    
    const fileHandles = await window.showOpenFilePicker(xlsPickerOpts)
        .then( async (fileHandles) => {             
            currentFileHandle = await fileHandles[0].getFile();

            productData = [];
            profile = [];

            document.getElementById("menuSidebarFileName").value = "";
            document.getElementById("menuSidebarFileDate").value = "";                
            document.getElementById("menuSidebarProductCount").value = ""; 
            document.getElementById("content-to-print").style.display = "none";
            document.getElementById("formButtonGuardarInfo").setAttribute("disabled", "disabled");
            document.getElementById("buttonGenerarPDF").setAttribute("disabled", "disabled");

            loadXls();           

            })
        .catch( (error) => {
            if (error.name === 'AbortError')
                return;
            console.log(error);
        });
};


async function loadXls() {

    persistence.set({ key: "configuracion", data: { currentFileHandle: currentFileHandle } })
        .catch( (error) => console.log(error) );    
    persistence.get(currentFileHandle.name)
        .then( (data) => {
            if (data === undefined){

                document.getElementById("menuSidebarFileName").value = currentFileHandle.name;
                const fileDate = getTimestamp(currentFileHandle.lastModifiedDate);
                const fileDateString = "" + fileDate.day + "/" + fileDate.month + "/" + fileDate.year + " " + fileDate.hours + ":" + fileDate.minutes + ":" + fileDate.seconds;                
                document.getElementById("menuSidebarFileDate").value = fileDateString;                
                document.getElementById("content-to-print-empty-message").style.display = "flex";
                document.getElementById("content-to-print-empty-message-text").innerHTML = "Se deben seleccionar las hojas y columnas que contienen los productos a incluir en el presupuesto. Haga click en el botón <span style='color: #0d6efd;'>'Configurar planilla'</span>.";
                document.getElementById("formButtonConfigurarPlanilla").removeAttribute("disabled");
                document.getElementById("buttonGenerarPDF").setAttribute("disabled", "disabled");
                //document.getElementById("hiddenModalButton").click();
            }else{                        
                profile = data;                                        
                
                var file = currentFileHandle;
                if (!file)
                    return;
                
                var reader = new FileReader();
                reader.onload = function(e) {
                    var contents = e.target.result;
                    var workbook = XLSX.readFile(contents, {dense: true});                    

                    productData = [];
                    
                    Object.keys(profile.data.fileSheets).forEach( (key) => {

                        const desciptionColumn = XLSX.utils.decode_col(profile.data.fileSheets[key].description);
                        const priceColumn = XLSX.utils.decode_col(profile.data.fileSheets[key].price);

                        for ( var i = profile.data.fileSheets[key].titlesRow; i <= workbook.Sheets[key]["!data"].length-1; i++){                                                                          
                            productData.push({
                                description: workbook.Sheets[key]["!data"][i][desciptionColumn].v,
                                price: workbook.Sheets[key]["!data"][i][priceColumn].v
                            });
                        }


                    });

                    productData.sort( (p1, p2 ) =>{                    
                        return p1.description.localeCompare(p2.description);
                    } );
                    
                    autocomplete(document.getElementById("autocompleteInput"), productData);  
                    fillForm();                    
                    window.scrollTo(0, 0);

                };
                reader.readAsArrayBuffer(file);            
            }
        })
        .catch( (error) => console.log(error) );                
   
};


async function formLogoOnClick() {

    const fileHandles = await window.showOpenFilePicker(imgPickerOpts);    
    profile.data.businessLogo = await fileHandles[0].getFile();        
    document.getElementById("formLogo").src = URL.createObjectURL(profile.data.businessLogo);    
    document.getElementById("formButtonGuardarInfo").removeAttribute("disabled");
};


function formInfoOnClick(e, index, header) {
    if (e.key === 'Enter') {        
        e.target.blur();
        return;        
    }

    const newValue = e.target.value;

    if (header){
        if (profile.data.businessInfo[index] !== newValue){
            profile.data.businessInfo[index] = newValue;
            document.getElementById("formButtonGuardarInfo").removeAttribute("disabled");  
        }
    }else{
        if (profile.data.businessInfoFooter[index] !== newValue){
            profile.data.businessInfoFooter[index] = newValue;
            document.getElementById("formButtonGuardarInfo").removeAttribute("disabled");         
        }
    }

    
};

 

/// FUNCIONES AUXILIARES ///

function fillForm(){

    showElement("productFormCol");
    
    const altaDate = getFutureDate();    
    document.getElementById("fechaAltaDia").value = altaDate.day;
    document.getElementById("fechaAltaMes").value = altaDate.month;
    document.getElementById("fechaAltaAnio").value = altaDate.year;

    const venDate = getFutureDate(5);
    document.getElementById("fechaVenDia").value = venDate.day;
    document.getElementById("fechaVenMes").value = venDate.month;
    document.getElementById("fechaVenAnio").value = venDate.year;
    
    document.getElementById("menuSidebarFileName").value = profile.data.fileHandle.name;
    const fileDate = getTimestamp(profile.data.fileHandle.lastModifiedDate);
    const fileDateString = "" + fileDate.day + "/" + fileDate.month + "/" + fileDate.year + " " + fileDate.hours + ":" + fileDate.minutes + ":" + fileDate.seconds;
    
    document.getElementById("menuSidebarFileDate").value = fileDateString;    
    document.getElementById("menuSidebarProductCount").value = productData.length;

    document.getElementById("content-to-print-empty-message").style.display = "none";
    document.getElementById("content-to-print").style.display = "block";
    document.getElementById("formButtonConfigurarPlanilla").removeAttribute("disabled");
    document.getElementById("buttonGenerarPDF").removeAttribute("disabled");

    if ( profile.data.businessLogo !== undefined ){
        document.getElementById("formLogo").src = URL.createObjectURL(profile.data.businessLogo);
        document.getElementById("formLogo").style.borderStyle = 'none';
    };
    if (profile.data.businessInfo === undefined){
        profile.data.businessInfo = [];
        profile.data.businessInfo.push("LINEA 1");
        profile.data.businessInfo.push("LINEA 2");
        profile.data.businessInfo.push("LINEA 3");
        profile.data.businessInfo.push("LINEA 4");
        profile.data.businessInfo.push("LINEA 5");
    };

    if (profile.data.businessInfo[0] !== undefined){
        document.getElementById("formInfo1").value = profile.data.businessInfo[0];
    };
    if (profile.data.businessInfo[1] !== undefined){
        document.getElementById("formInfo2").value = profile.data.businessInfo[1];
    };
    if (profile.data.businessInfo[2] !== undefined){
        document.getElementById("formInfo3").value = profile.data.businessInfo[2];
    };
    if (profile.data.businessInfo[3] !== undefined){
        document.getElementById("formInfo4").value = profile.data.businessInfo[3];
    };
    if (profile.data.businessInfo[4] !== undefined){
        document.getElementById("formInfo5").value = profile.data.businessInfo[4];
    };
        

    if (profile.data.businessInfoFooter === undefined){
        profile.data.businessInfoFooter = [];
        profile.data.businessInfoFooter.push("LINEA 1");
        profile.data.businessInfoFooter.push("LINEA 2");
        profile.data.businessInfoFooter.push("LINEA 3");
    };    

    if (profile.data.businessInfoFooter[0] !== undefined){
        document.getElementById("docFooter1").value = profile.data.businessInfoFooter[0];
    };
    if (profile.data.businessInfoFooter[1] !== undefined){
        document.getElementById("docFooter2").value = profile.data.businessInfoFooter[1];
    };
    if (profile.data.businessInfoFooter[2] !== undefined){        
        document.getElementById("docFooter3").value = profile.data.businessInfoFooter[2];
    };
};












function selectProduct() {    

    document.getElementById("contentAutocomplete").style.display = "none";

    const autocompleteInput = document.getElementById("autocompleteInput");

    const parent = document.getElementById("contentBodyDetailParent");

    const row = document.createElement("div");
    row.className = "row content-body-cell-title-product-row";
    row.id = "productRow" + autocompleteInput.dataset.indexId;
    row.dataset.indexId = autocompleteInput.dataset.indexId;
 
    const colId = document.createElement("div");
    colId.className = "col-auto detail-cell-item-id";
    colId.innerText = Number(autocompleteInput.dataset.indexId) + 1;
    
    const colDescription = document.createElement("input");
    colDescription.className = "col-auto detail-cell-item-desc not-eligible";
    colDescription.value = autocompleteInput.value;
    colDescription.id = "colDescription" + autocompleteInput.dataset.indexId;
    colDescription.dataset.indexId = autocompleteInput.dataset.indexId;
    colDescription.setAttribute("readonly", "readonly");    

    const colPrice = document.createElement("input");
    colPrice.className = "col-auto detail-cell-item-price-unit not-eligible";
    colPrice.value = toDecimalString(autocompleteInput.dataset.price);      
    colPrice.id = "colPrice"+autocompleteInput.dataset.indexId;
    colPrice.dataset.indexId = autocompleteInput.dataset.indexId;
    colPrice.dataset.number = redondear(autocompleteInput.dataset.price);
    //setInputFilter(colPrice, decimalFilter, "Solo se permiten digitos y '.'");
    colPrice.setAttribute("readonly", "readonly");
    

    const colQuantity = document.createElement("input");
    colQuantity.className = "col-auto detail-cell-item-quantity empty-field";
    colQuantity.id = "colQuantity"+autocompleteInput.dataset.indexId;
    colQuantity.dataset.indexId = autocompleteInput.dataset.indexId;
    setInputFilter(colQuantity, integerFilter, "Solo se permiten digitos.");    
    colQuantity.addEventListener("change", (e) => {
        if ( e.target.value !== undefined && e.target.value !== '' ){
            e.target.className = "col-auto detail-cell-item-quantity";             
            colChangeHandler('quantity', e.target.dataset.indexId);
            document.getElementById("autocompleteInput").focus({ focusVisible: true });
            document.getElementById("autocompleteInput").select();
        };                
        e.preventDefault();
    });
    

    const colTotalPrice = document.createElement("div");
    colTotalPrice.className = "col-auto detail-cell-item-price-total not-eligible"    
    colTotalPrice.id = "colTotalPrice"+autocompleteInput.dataset.indexId;
    colTotalPrice.dataset.indexId = autocompleteInput.dataset.indexId;
    colTotalPrice.dataset.number = 0;      
    colTotalPrice.setAttribute("readonly", "readonly");  

    row.appendChild(colId);
    row.appendChild(colDescription);
    row.appendChild(colPrice);
    row.appendChild(colQuantity);
    row.appendChild(colTotalPrice);
    

    parent.appendChild(row);


    autocompleteInput.value = '';
    autocompleteInput.dataset.price = '';

    colQuantity.focus({ focusVisible: true });
};


function autocomplete(inp, arr) {

    var currentFocus;

    inp.addEventListener("input", function(e) {
        var a, b, i, val = this.value;

        closeAllLists();

        if (!val) { return false;}
        currentFocus = -1;
        a = document.createElement("div");
        a.setAttribute("id", this.id + "autocomplete-list");
        a.setAttribute("class", "autocomplete-items");       
        this.parentNode.appendChild(a);
       
        for (i = 0; i < arr.length; i++) {
       
          if (arr[i].description.substr(0, val.length).toUpperCase() == val.toUpperCase()) {
       
            b = document.createElement("div");
            b.innerHTML = "<span style='color: blue;'>" + arr[i].description.substr(0, val.length) + "</span>";
            b.innerHTML += arr[i].description.substr(val.length);
            b.innerHTML += "<input type='hidden' value='" + arr[i].description + "' data-indexId='"+i+"' data-price='"+ arr[i].price +"' >";
                b.addEventListener("click", function(e) {
                
                inp.value = this.getElementsByTagName("input")[0].value;
                inp.dataset.price = this.getElementsByTagName("input")[0].dataset.price;                
                inp.dataset.indexId = document.getElementById("contentBodyDetailParent").children.length;

                closeAllLists();
                selectProduct();
            });
            a.appendChild(b);
          }
        }
    });
    inp.addEventListener("keydown", function(e) {
        var x = document.getElementById(this.id + "autocomplete-list");
        if (x) x = x.getElementsByTagName("div");
        if (e.keyCode == 40) {
          currentFocus++;
          addActive(x);
        } else if (e.keyCode == 38) { //up
          currentFocus--;
          addActive(x);
        } else if (e.keyCode == 13) {
          e.preventDefault();
          if (currentFocus > -1) {
            if (x) x[currentFocus].click();
          }
        }
    });
    function addActive(x) {
      if (!x) return false;
      removeActive(x);
      if (currentFocus >= x.length) currentFocus = 0;
      if (currentFocus < 0) currentFocus = (x.length - 1);
      x[currentFocus].classList.add("autocomplete-active");
    }
    function removeActive(x) {
      for (var i = 0; i < x.length; i++) {
        x[i].classList.remove("autocomplete-active");
      }
    }

    function closeAllLists(elmnt) {
        var x = document.getElementsByClassName("autocomplete-items");
        for (var i = 0; i < x.length; i++) {
          if (elmnt != x[i] && elmnt != inp) {
          x[i].parentNode.removeChild(x[i]);
        }
      }
    };
    
    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });
    
};


function disableElement(elementId){
    document.getElementById(elementId).setAttribute("disabled", "disabled");
};


function enableElement(elementId){
    document.getElementById(elementId).removeAttribute("disabled");
};


function hideElement(elementId){
    document.getElementById(elementId).style.display = "none";
};


function showElement(elementId){
    document.getElementById(elementId).style.display ="inline-block";
};


function colChangeHandler(type, index){    

    const rowProductRow = document.getElementById("productRow" + index);
    
    const colDescription = document.getElementById("colDescription" + index);
    const colPrice = document.getElementById("colPrice" + index);
    const colQuantity = document.getElementById("colQuantity" + index);    
    const colTotalPrice = document.getElementById("colTotalPrice" + index);        

    if (type === 'price' && !colQuantity.value )
        return;
    if (type === 'quantity' && !colPrice.value )
        return;
    
    const newTotalPrice = redondear(colPrice.dataset.number) * redondear(colQuantity.value);    
    colTotalPrice.innerText = toDecimalString(newTotalPrice);  
    colTotalPrice.dataset.number = redondear(newTotalPrice);
    
    
    colQuantity.setAttribute("readonly", "readonly");
    colQuantity.className =  colQuantity.className + " not-eligible deletable";
    
    
    updateTotalPrice();

    if (document.getElementById("contentBodyDetailParent").children.length <= maxProducts )
        document.getElementById("contentAutocomplete").style.display = "flex";
    

}

function updateTotalPrice(){

    var finalPrice = 0;

    const parent = document.getElementById("contentBodyDetailParent");
    for(var i = 0 ; i < parent.children.length ; i++){        
       
        const child = document.getElementById("colTotalPrice"+i);
        if (child){
            const value = Number(child.dataset.number);            
            finalPrice += redondear( Number(value)  );
        }
    }
    
    document.getElementById("colTotalPrice").innerText = toDecimalString(finalPrice); // addTrailingZeros(Number(redondear(finalPrice).toFixed(2)).toLocaleString('es-AR'));


};

function addTrailingZeros(stringNumber){

    var result = stringNumber;   
    const index  = stringNumber.indexOf(",") + 1;

    if (index === 0){
        result = stringNumber + ',00' ;        
    }else{
        var diff  = 2 - stringNumber.substring(index).length ;
        
        while (diff > 0){
            result = result + '0';
            diff--;
        }
    }

    return result;
};

function toDecimalString(value){   
    return addTrailingZeros( Number(redondear(value).toFixed(2)).toLocaleString('es-AR') );
}


function generarPDF() {

    hideElement("productFormCol");

    formEmpresaPlaceholder = document.getElementById("formEmpresa").placeholder;
    document.getElementById("formEmpresa").placeholder = "";

    formContactoPlaceholder =  document.getElementById("formContacto").placeholder;
    document.getElementById("formContacto").placeholder = "";

    formDireccionPlaceholder =  document.getElementById("formDireccion").placeholder;
    document.getElementById("formDireccion").placeholder = "";

    formTelefonoPlaceholder =  document.getElementById("formTelefono").placeholder;
    document.getElementById("formTelefono").placeholder = "";

    document.getElementById("formLogo").className.replace(" custom-info","");
    document.getElementById("contentHeader").className.replace(" custom-info","");    
    document.getElementById("contentFooter").className.replace(" custom-info","");
    

    html2canvas(document.getElementById("content-to-print"),
        {
            //width: 1920, height: 1080
        }).then(function (canvas) {
            var imgData = canvas.toDataURL('image/png')
            //var doc = new jspdf.jsPDF('p', 'mm');
            var doc = new jspdf.jsPDF(
                {
                    orientation: 'p',
                    unit: 'in',
                    format: 'a4'
                    //format: [10000, 1800], //'a4',
                    //format: [297, 210], //'a4',
                    //hotfixes: ["px_scaling"],


                }
            )

            var width = doc.internal.pageSize.getWidth()
            var height = doc.internal.pageSize.getHeight()

            //doc.addImage(imgData, 'PNG', 10, 10);
            //doc.addImage(imgData, 'JPEG', 10, 10, width, height);
            //doc.addImage(imgData, 'JPEG', 0, 0, height, width);
            doc.addImage(imgData, 'PNG', 0, 0, width, height)
            doc.save('presupuesto.pdf')            
            //document.body.appendChild(canvas);

            showElement("productFormCol");                

            document.getElementById("formEmpresa").placeholder = formEmpresaPlaceholder;                    
            document.getElementById("formContacto").placeholder = formContactoPlaceholder;                 
            document.getElementById("formDireccion").placeholder = formDireccionPlaceholder;            
            document.getElementById("formTelefono").placeholder = formTelefonoPlaceholder;            

            document.getElementById("formLogo").className += " custom-info";
            document.getElementById("contentHeader").className += " custom-info";    
            document.getElementById("contentFooter").className += " custom-info";

        }
        ).catch((error) => {productInputCol.display = currentDisplay;});


        
};

