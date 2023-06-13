function Persistence (storageName) {
    
    this.storageName = storageName;

    this.isEnabled = () => {
        if ('indexedDB' in window)
            return true;
        console.log("indexedDB not suported");
        return false;               
    };
    
    this.delete = () => {
        window.indexedDB.deleteDatabase(storageName);    
    };

    this.get = (key) => {

        return new Promise( (resolve, reject ) => {
                
            const reqOpen =  window.indexedDB.open(storageName, 1);    
            reqOpen.onerror = (e) => {
                reject(e);            
            };
            reqOpen.onupgradeneeded = (e) => {                    
                const dbOpen = e.target.result;            
                const osOpen = dbOpen.createObjectStore("data", { keyPath: "key" });           
                osOpen.onerror = (e) => {
                    reject(e);          
                };    
            };
            reqOpen.onsuccess = (e) =>  {                         
                var dbGet = e.target.result;        
                var objectStoreGet = dbGet.transaction(["data"]).objectStore("data");        
                const reqGet = objectStoreGet.get(key);
                reqGet.onerror = (e) => {
                    reject(e);  
                };
                reqGet.onsuccess = (e) => {                    
                    if (reqGet.result === undefined){
                        resolve(undefined);
                    }else{                                                
                        resolve(reqGet.result);
                    }                
                                    
                };            
            };
            
        });

    };    

    this.set = (entry) => {

        return new Promise( (resolve, reject ) => { 

            var reqOpen = window.indexedDB.open(storageName, 1);    
            reqOpen.onerror = (e) => {
              reject(e);
            };
            reqOpen.onupgradeneeded = (e) => {                    
                const dbOpen = e.target.result;            
                const osOpen = dbOpen.createObjectStore("data", { keyPath: "key" });           
                osOpen.onerror = (e) => {
                    reject(e);
                };    
            };
            reqOpen.onsuccess = (e) => {            
                var dbGet = e.target.result;        
                var objectStoreGet = dbGet.transaction(["data"]).objectStore("data");        
                const reqGet = objectStoreGet.get(entry.key);
                reqGet.onerror = (e) => {
                    reject(e);
                };
                reqGet.onsuccess = (e) => {                
                    var objectStoreSet = dbGet.transaction(["data"], "readwrite").objectStore("data");                    
                    var reqSet;
                    if (reqGet.result === undefined){                    
                        reqSet = objectStoreSet.add(entry);                    
                    }else{                    
                        reqSet = objectStoreSet.put(entry);
                    }
                    reqSet.onsuccess = (e) => {                        
                        resolve(true);
                    };
                    reqSet.onerror = (e) => {                        
                        reject(e);                        
                    };                                
                };              
            };

        });
    };
};
