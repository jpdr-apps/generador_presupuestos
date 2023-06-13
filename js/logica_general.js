var appData = { files: {} };

function getFutureDate(sumarDias){
    const date = new Date();
    const offset = date.getTimezoneOffset();
    var newDate = new Date(date.getTime() - (offset*60*1000));   
    newDate.setDate(newDate.getDate() + (sumarDias !== undefined ? sumarDias : 0 ) );

    return ({
        day : newDate.getDate(),
        month: newDate.getMonth()+1,
        year: newDate.getFullYear()
    });

}

function getTimestamp(date){
  return ({
    day : date.getDate(),
    month: date.getMonth()+1,
    year: date.getFullYear(),
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
});

}


function loadAppData(){
    if (Cookies.get('AppData') === undefined)
        Cookies.set('AppData', '{ "currentFile": "", "files": {} }', { expires: 3650} );            
    appData = JSON.parse(Cookies.get('AppData'));         
    console.log(appData);
}

function saveAppData(){
    Cookies.set('AppData', JSON.stringify(appData),  { expires: 3650} );
    console.log(Cookies.get('AppData'));
}


function setInputFilter(textbox, inputFilter, errMsg) {
    [ "input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop", "focusout" ].forEach(function(event) {
      textbox.addEventListener(event, function(e) {
        if (inputFilter(this.value)) {
          // Accepted value.
          if ([ "keydown", "mousedown", "focusout" ].indexOf(e.type) >= 0){
            this.classList.remove("input-error");
            this.setCustomValidity("");
          }
  
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        }
        else if (this.hasOwnProperty("oldValue")) {
          // Rejected value: restore the previous one.
          this.classList.add("input-error");
          this.setCustomValidity("");//(errMsg);
          this.reportValidity();
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        }
        else {
          // Rejected value: nothing to restore.
          this.value = "";
        }
      });
    });
  }

function decimalFilter(value){
    return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a RegExp.
}

function integerFilter(value){    
    return /^\d+$/.test(value); //Solo digitos, sin puntos ni comas.
}

function redondear(value){
    return Math.round((Number(value)+ Number.EPSILON) * 100) / 100;
}

const openFile = async () => {
  try {
    // Always returns an array.
    const [handle] = await window.showOpenFilePicker();
    return handle.getFile();
  } catch (err) {
    console.error(err.name, err.message);
  }
};
