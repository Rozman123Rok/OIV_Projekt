var id_zadnega // id zadnega sporocila
let link_za_testiranje
let stevec = 0
polni=false

$(document).ready(function(){
    $('#submitButton').click(function(){
        ime = document.getElementById("username").value // dobimo vpisano vrednost
        room = document.getElementById("room").value // dobimo vpisano vrednost
        geslo = document.getElementById("password").value // dobimo vpisano vrednost
        polni=true // da lahko zacnemo v intervalu gledat
  
        $("#m").show(); 
        $("#send").show(); 
        $("#loginForm").hide(); 
        $("#submitButton").hide(); 
        stevilo_prikaza_vseh = 0

        encode_room = btoa(room) // ZAKODIRAMO IME SOBE DA LHAKO UPORABIMO

        Url_get='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages'; // SI SHRANIM LINK ZA DOBIVANJE VSEH SPOROCIL
        Url_post='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/message' // SHRANIM LINK ZA POSILJANJE SPOROCIL
    
        //sifriran room pass
        var pass = geslo;
        sha256(pass); // hasham geslo da ga lahko potem uporabim
        $.getJSON(Url_get, function(result){
            if(result.length == 0){
                // ce je se praazno pomeni da se ni bilo sporocil
                zacetno_sporocilo(Url_post); // posljem zacetno sporocilo da je oseba zacela pogovor
                link_test = Url_get;  // si shranim link da dostopam samo do zadnega sporocila
            }
            else{
                // lahko prikazemo sporocila
                link_test = prikaziDobSpo(result)  // prikazemo sporocila in updatamo link
                stevilo_prikaza_vseh = 1 // da smo jih zi prikazali vse
            }
        })
      })

    // KO STISNEM GUMB ZA SEND
    $('#send').click(function(){
        var xhr = new XMLHttpRequest();
        xhr.open("PUT", Url_post);
        
        xhr.setRequestHeader("Accept", "application/json");
        xhr.setRequestHeader("Content-Type", "application/json");
        
        xhr.onreadystatechange = function () {
           if (xhr.readyState === 4) {
              console.log(xhr.status);
              console.log(xhr.responseText);
           }};
        
        const date = new Date(); // DOBIM DATUM

        //RFC 3339 format
        const formatted = date.toISOString(); // SI SHRANIMO FORMAT

        sporocilo = CryptoJS.enc.Utf16.parse(document.getElementById("m").value);                           // poberem sporocilo iz forma

        const passHash = CryptoJS.SHA256(geslo);                                                            // si hasham geslo
        const iv = CryptoJS.lib.WordArray.random(16);                                                       // random iv 
        const key = CryptoJS.enc.Hex.parse(passHash.toString());                                            // naredim key
        const encrypted = CryptoJS.AES.encrypt(sporocilo, key, {iv: iv});                                   // enkriptam sporocilo
        const ivHex = CryptoJS.enc.Hex.stringify(iv)                                                        // iv dam v hex
        const messageHex = CryptoJS.enc.Hex.stringify(encrypted.ciphertext)                                 // kriptirano sporocilo v hex
        const finalMessage = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ivHex + messageHex))      // zdruzim iv in sporocilo za posiljanje
       
        // USTVARIMO DATA DA LAHKO POSLEMO
        var data = `{
            "time": "` + formatted + `",
            "user": "` + ime + `",
            "message": "` + finalMessage + `"
        }`;
        
        xhr.send(data);                                 // POSLEMO DATA
        document.getElementById("m").value = "";        // SPRAZNIMO TEXTBOX

    })
    
        
    setInterval(function(){
        if(polni){
            console.log("POLNI")
            $.getJSON(link_test, function(result){
                link_za_testiranje = link_test
                link_test = prikaziDobSpo(result)
                
            })
        }  
        else{
            console.log("Ne se polni")
        }
    }, 500);
})


function prikaziDobSpo(data){
    let authorClass = "";
    let divClass = ""

    for(i=0;i<data.length;i++){

        if(data[i].user == ime){
            authorClass="jaz"
            divClass = "mojDiv";
        }
        else{
            authorClass="drug"
            divClass = "drugDiv";
        }

        sporocilo = data[i].message;                                                                            // dobim sporocilo iz data
        const passHash = CryptoJS.SHA256(geslo);                                                                // hasham geslo
        const key = CryptoJS.enc.Hex.parse(passHash.toString());                                                // ustvarim key
        const inputMessage = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(sporocilo))                   // decodam sporocilo
        const decIV = CryptoJS.enc.Hex.parse(inputMessage.slice(0,32));                                         // odrezem iv
        const decMessageEncrypted = CryptoJS.enc.Hex.parse(inputMessage.slice(32));                             // preostalo sporocilo
        const decrypted = CryptoJS.AES.decrypt({ciphertext: decMessageEncrypted}, key, {iv: decIV});            // dekodiram sporocilo
        const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8)                                          // spremenim v string
        
        // PRIKAZOVANJE SPOROCIL
        const div = document.createElement("div");
        div.className = divClass;
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.className = "time";
        p.innerHTML = '<p>' + data[i].time+ '</p>'
        div.innerHTML = '<p class="' + authorClass + '">' + data[i].user + "</p>" + '<p class="message"> ' + decryptedMessage + "</p>";
        div.appendChild(p);
        li.appendChild(div);

        document.getElementById("messages").appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
    }

    // SI SHRANIM ID ZADNEGA
    if(stevec == 0){
        id_zadnega = data[0].id;
        Url_samo_eno='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages/from_id/' + id_zadnega + ''// LINK ZA DOBIVANJE SAMO ENEGA SPOROCILA
        stevec = 1
    }
    else{
        if(data.length != 0 ){
            id_zadnega = data[data.length-1].id;
            Url_samo_eno='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages/from_id/' + id_zadnega + ''// LINK ZA DOBIVANJE SAMO ENEGA SPOROCILA
        }
    }

    return Url_samo_eno
}


function zacetno_sporocilo(Url_post){
    var xhr = new XMLHttpRequest();
    xhr.open("PUT", Url_post);
        
    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/json");
        
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log(xhr.status);
            console.log(xhr.responseText);
        }};
    
    const date = new Date(); // DOBIM DATUM

    //RFC 3339 format
    const formatted = date.toISOString(); // SI SHRANIMO FORMAT
    sporocilo = CryptoJS.enc.Utf16.parse(ime + " je zacel pogovor")

    const passHash = CryptoJS.SHA256(geslo);
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.enc.Hex.parse(passHash.toString());
    const encrypted = CryptoJS.AES.encrypt(sporocilo, key, {iv: iv});

    const ivHex = CryptoJS.enc.Hex.stringify(iv)
    const messageHex = CryptoJS.enc.Hex.stringify(encrypted.ciphertext)
    const finalMessage = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ivHex + messageHex))

    // USTVARIMO DATA DA LAHKO POSLEMO
    var data = `{
        "time": "` + formatted + `",
        "user": "` + ime + `",
        "message": "` + finalMessage + `"
    }`;
    
    xhr.send(data); // POSLEMO DATA
}

function sha256(pass){
    var hash = CryptoJS.SHA256(pass);
    console.log("Hash-Geslo:" + hash);
    return hash
}

