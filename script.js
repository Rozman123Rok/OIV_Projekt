var id_zadnega // id zadnega sporocila
let link_za_testiranje
let stevec = 0

$(document).ready(function(){

    console.log("Moje ime:" + ime) // IME KI SI GA VPISAL
    console.log("Soba:" + room) // IME SOBE KI SI VPISAL
    encode_room = btoa(room) // ZAKODIRAMO IME SOBE DA LHAKO UPORABIMO

    //console.log("Encode: " + btoa(room))
    //var id_zadnega // id zadnega sporocila
    const Url_get='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages'; // SI SHRANIM LINK ZA DOBIVANJE VSEH SPOROCIL
    const Url_post='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/message' // SHRANIM LINK ZA POSILJANJE SPOROCIL
    let spo = ""
    console.log(ime + " " + room)
    stevilo_prikaza_vseh = 0

    //sifriran room pass
    var pass = geslo;
    console.log("Geslo:" + pass);
    sha256(pass);
    

    // takoj ko je hocemo vsa sporocila
    $.getJSON(Url_get, function(result){
        console.log("Result:" + result)
        if(result.length == 0){
            console.log("Ni se bilo sporocil posli da zacenjas pogovor!");
            zacetno_sporocilo(Url_post);
            link_test = Url_get;  // mogoce je tu error
        }
        else{
            // lahko prikazemo sporocila
            link_test = prikaziDobSpo(result)  
            stevilo_prikaza_vseh = 1
        }
        //link_test = prikaziDobSpo(result)
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

        // encrypt message
        sporocilo = document.getElementById("m").value;
        console.log("SPOROCILO PRED JE : " + sporocilo)

        console.log(" ------------------------------------ PRICETEK SIFRIRANJA ------------------------------")
        const passHash = CryptoJS.SHA256(geslo);
        const iv = CryptoJS.lib.WordArray.random(16);
        const key = CryptoJS.enc.Hex.parse(passHash.toString());
        const encrypted = CryptoJS.AES.encrypt(sporocilo, key, {iv: iv});
        const ivHex = CryptoJS.enc.Hex.stringify(iv)
        const messageHex = CryptoJS.enc.Hex.stringify(encrypted.ciphertext)
        const finalMessage = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ivHex + messageHex))
        
        /*
        var hash_geslo = sha256(geslo);
        console.log("Key: " + hash_geslo)
        console.log("Hashano geslo: " + hash_geslo)
        //console.log("Hashano geslo type of: " + typeof(hash_geslo))

        var moj_iv = CryptoJS.lib.WordArray.random(16);
        console.log("iv:" + moj_iv)
        //console.log("iv:" + moj_iv.toString())
        //console.log("iv type of:" + typeof(moj_iv))

        var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, hash_geslo, { iv: moj_iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        console.log("zakodirano spo:" + zakodirano_spo);
        //console.log("zakodirano spo typeof:" + typeof(zakodirano_spo));

        var skupaj = moj_iv.toString() + zakodirano_spo.toString()
        console.log("Skupaj: " + skupaj)
        var spo_base64url = encode_Base64url(skupaj);
        //var spo_base64url = btoa(skupaj);
        */




        /*
        //JSON.stringify({ str }), 'secret'
        var hashiran = sha256(geslo);
        var iv = CryptoJS.enc.Hex.parse(CryptoJS.lib.WordArray.random(16));
        console.log("iv:" + iv)
        var key = CryptoJS.enc.Hex.parse(hashiran);
        console.log("key:" + key)
        var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, key, { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        console.log("zakodirano spo:" + zakodirano_spo);
        var temp_spo = atob(zakodirano_spo);
        let arr_temp = [];
        var iv_spo = iv + temp_spo;
        console.log("iv+spo:" + iv_spo);
        var zakodiran_arr = encode_Base64url(iv_spo);
        */

        //var zakodirano_spo = CryptoJS.AES.encrypt(JSON.stringify({ sporocilo }), encode_room);



        // USTVARIMO DATA DA LAHKO POSLEMO
        var data = `{
            "time": "` + formatted + `",
            "user": "` + ime + `",
            "message": "` + finalMessage + `"
        }`;
        
        xhr.send(data); // POSLEMO DATA
        document.getElementById("m").value = ""; // SPRAZNIMO TEXTBOX
        /*
        // POGLEDAM CE SMO ZI PRIKAZALI VSE
        if(stevilo_prikaza_vseh == 0){
            // PRIKAZEMO VSA SPOROCILA

            $.getJSON(Url_get, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
            stevilo_prikaza_vseh = 1 // povecamo na 1
        }
        else{
            // PRIKAZEMO SAMO ZADNIH NEKAJ
            $.getJSON(link_test, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
        }
        */
    })

    setInterval(function(){
        $.getJSON(link_test, function(result){
            link_za_testiranje = link_test
            link_test = prikaziDobSpo(result)
            
        })  

     }, 500);

    $('#btn').click(function(){
        // GUMB ZA PRIKAZ VSEH SPOROCIL
        $.getJSON(Url_get, function(result){
           link_test = prikaziDobSpo(result)
       })
    })

    $('#btn_enega').click(function(){
        // GUMB ZA PRIKAZ ENEGA
        $.getJSON(link_test, function(result){
            link_test = prikaziDobSpo(result)
       })
    })
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
        console.log(" ------------------------------- PRICETEK DEKODIRANJA -------------------------------------------")
        sporocilo = data[i].message;
        const passHash = CryptoJS.SHA256(geslo);
        const key = CryptoJS.enc.Hex.parse(passHash.toString());
        const inputMessage = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(sporocilo))
        const decIV = CryptoJS.enc.Hex.parse(inputMessage.slice(0,32));
        const decMessageEncrypted = CryptoJS.enc.Hex.parse(inputMessage.slice(32));
        const decrypted = CryptoJS.AES.decrypt({ciphertext: decMessageEncrypted}, key, {iv: decIV});
        const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8)
        
        
        /*
        sporocilo = data[i].message;
        console.log("Sporocilo: " + sporocilo)
        var key = sha256(geslo);
        console.log("Key: " + key)
        
        //var decoded_sporocilo = base64DecodeURL(sporocilo);
        var decoded_sporocilo = decode_Base64url(sporocilo);
        //var decoded_sporocilo = atob(sporocilo);
        console.log("Decode sporocilo: " + decoded_sporocilo)
        var iv_po = CryptoJS.enc.Hex.parse(decoded_sporocilo.slice(0,32));
        console.log("IV PO: " + iv_po)
        var preostaalo_sporocilo = decoded_sporocilo.slice(32);
        console.log("Preostalo sporocilo: " + preostaalo_sporocilo)
        decrypted = CryptoJS.AES.decrypt(preostaalo_sporocilo, key, {iv: iv_po,mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        pravo = decrypted.toString(CryptoJS.enc.Utf8)
        console.log("Pravo: " + pravo)
        */
        /*
        spo = data[i].message
        var hashed = sha256(geslo);
        var decoded_arr = decode_Base64url(spo);
        var iv = decoded_arr.slice(0,16);
        var iv_temp = CryptoJS.enc.Hex.parse(CryptoJS.lib.ByteArray(iv));
        var sporocilo = decoded_arr.slice(16);
        var sporocilo_temp = CryptoJS.enc.Hex.parse(CryptoJS.lib.ByteArray(sporocilo));
        console.log("sporocilo test:"+ sporocilo_temp)
        //var ciphertext = CryptoJS.enc.Hex.parse(spo);
        var key = CryptoJS.enc.Hex.parse(hashed);
        console.log("key decrypt:" + key)
        console.log("iv decrypt:" + iv_temp)
        decrypted = CryptoJS.AES.decrypt(sporocilo_temp, key, {iv: iv_temp,mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        console.log("spo: " + spo)
        console.log("de: " + decrypted)
        console.log("PRAVO: " + decrypted.toString(CryptoJS.enc.Utf8))
        pravo = decrypted.toString(CryptoJS.enc.Utf8)
        */
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
    sporocilo = ime + " je zacel pogovor"

    const passHash = CryptoJS.SHA256(geslo);
    const iv = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.enc.Hex.parse(passHash.toString());
    const encrypted = CryptoJS.AES.encrypt(sporocilo, key, {iv: iv});

    const ivHex = CryptoJS.enc.Hex.stringify(iv)
    const messageHex = CryptoJS.enc.Hex.stringify(encrypted.ciphertext)
    const finalMessage = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ivHex + messageHex))



        /*
    var hash_geslo = sha256(geslo);
    console.log("Hashano geslo: " + hash_geslo)
    //console.log("Hashano geslo type of: " + typeof(hash_geslo))

    var moj_iv = CryptoJS.lib.WordArray.random(16);
    console.log("iv:" + moj_iv)
    //console.log("iv:" + moj_iv.toString())
    //console.log("iv type of:" + typeof(moj_iv))

    var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, hash_geslo, { iv: moj_iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    //console.log("zakodirano spo:" + zakodirano_spo);
    //console.log("zakodirano spo typeof:" + typeof(zakodirano_spo));

    var skupaj = moj_iv.toString() + zakodirano_spo.toString()
    //console.log("Skupaj: " + skupaj)
    var spo_base64url = encode_Base64url(skupaj);
*/

    /*
    hash_pass = sha256(geslo);
    var iv = CryptoJS.enc.Hex.parse(CryptoJS.lib.WordArray.random(8));
    console.log("iv:" + iv)
    var key = CryptoJS.enc.Hex.parse(hash_pass);
    console.log("key:" + key)
    var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, key, {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    console.log("KRIPTIRAN SPOROCILO:" + zakodirano_spo);
    var temp_spo = atob(zakodirano_spo);
    let arr_temp = [];
    var iv_spo = iv + temp_spo;
    console.log("iv+spo:" + iv_spo);
    var zakodiran_arr = encode_Base64url(iv_spo);
    */

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

function test_base(input) {
    console.log("To je v funkciji pred: " + input)
    // Replace non-url compatible chars with base64 standard chars
    input = input
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    // Pad out with standard base64 required padding characters
    var pad = input.length % 4;
    if(pad) {
      if(pad === 1) {
        throw new Error('InvalidLengthError: Input base64url string is the wrong length to determine padding');
      }
      input += new Array(5-pad).join('=');
    }
    console.log("To je v funkciji po:   " + input)
    return input;
}

function base64EncodeURL(byteArray) {
    return btoa(Array.from(new Uint8Array(byteArray)).map(val => {
      return String.fromCharCode(val);
    }).join('')).replace(/\+/g, '-').replace(/\//g, '_').replace(/\=/g, '');
  }
  
  function base64DecodeURL(b64urlstring) {
    return new Uint8Array(atob(b64urlstring.replace(/-/g, '+').replace(/_/g, '/')).split('').map(val => {
      return val.charCodeAt(0);
    }));
  }

function unescape (str) {
    return (str + '==='.slice((str.length + 3) % 4)).replace(/-/g, '+').replace(/_/g, '/')
}

function escape (str) {
    return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function encode_Base64url (str) {
    return escape(btoa(str));
}
  
function decode_Base64url (str) {
    return atob(test_base(str))
    //return atob(unescape(str))
}




/*
var id_zadnega // id zadnega sporocila
let link_za_testiranje
let stevec = 0

$(document).ready(function(){

    console.log("Moje ime:" + ime) // IME KI SI GA VPISAL
    console.log("Soba:" + room) // IME SOBE KI SI VPISAL
    encode_room = btoa(room) // ZAKODIRAMO IME SOBE DA LHAKO UPORABIMO

    //console.log("Encode: " + btoa(room))
    //var id_zadnega // id zadnega sporocila
    const Url_get='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages'; // SI SHRANIM LINK ZA DOBIVANJE VSEH SPOROCIL
    const Url_post='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/message' // SHRANIM LINK ZA POSILJANJE SPOROCIL
    let spo = ""
    console.log(ime + " " + room)
    stevilo_prikaza_vseh = 0

    //sifriran room pass
    var pass = geslo;
    console.log("Geslo:" + pass);
    sha256(pass);
    



    // takoj ko je hocemo vsa sporocila
    $.getJSON(Url_get, function(result){
        console.log("Result:" + result)
        if(result.length == 0){
            console.log("Ni se bilo sporocil posli da zacenjas pogovor!");
            zacetno_sporocilo(Url_post);
            link_test = Url_get;  // mogoce je tu error
        }
        else{
            // lahko prikazemo sporocila
            link_test = prikaziDobSpo(result)  
            stevilo_prikaza_vseh = 1
        }
        //link_test = prikaziDobSpo(result)
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

        // encrypt message
        sporocilo = document.getElementById("m").value;
        //JSON.stringify({ str }), 'secret'
        var hashiran = sha256(geslo);
        var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");

        console.log("iv:" + iv.toString())
        var key = CryptoJS.enc.Hex.parse(hashiran.toString(CryptoJS.enc.Hex).substr(0, 32));
        var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, String(key), { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        //var zakodirano_spo = CryptoJS.AES.encrypt(JSON.stringify({ sporocilo }), encode_room);



        // USTVARIMO DATA DA LAHKO POSLEMO
        var data = `{
            "time": "` + formatted + `",
            "user": "` + ime + `",
            "message": "` + zakodirano_spo + `"
        }`;
        
        xhr.send(data); // POSLEMO DATA
        document.getElementById("m").value = ""; // SPRAZNIMO TEXTBOX
        
        // POGLEDAM CE SMO ZI PRIKAZALI VSE
        if(stevilo_prikaza_vseh == 0){
            // PRIKAZEMO VSA SPOROCILA

            $.getJSON(Url_get, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
            stevilo_prikaza_vseh = 1 // povecamo na 1
        }
        else{
            // PRIKAZEMO SAMO ZADNIH NEKAJ
            $.getJSON(link_test, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
        }
    })

    setInterval(function(){
        $.getJSON(link_test, function(result){
            link_za_testiranje = link_test
            link_test = prikaziDobSpo(result)
            
        })  

     }, 500);

    $('#btn').click(function(){
        // GUMB ZA PRIKAZ VSEH SPOROCIL
        $.getJSON(Url_get, function(result){
           link_test = prikaziDobSpo(result)
       })
    })

    $('#btn_enega').click(function(){
        // GUMB ZA PRIKAZ ENEGA
        $.getJSON(link_test, function(result){
            link_test = prikaziDobSpo(result)
       })
    })
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

        spo = data[i].message
        var hashed = sha256(geslo);
        
        //var ciphertext = CryptoJS.enc.Hex.parse(spo);
        var key = CryptoJS.enc.Hex.parse(hashed);
        var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
        decrypted = CryptoJS.AES.decrypt(spo, String(key), {iv: iv,mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        console.log("spo: " + spo)
        console.log("de: " + decrypted)
        console.log("PRAVO: " + decrypted.toString(CryptoJS.enc.Utf8))
        pravo = decrypted.toString(CryptoJS.enc.Utf8)

        const div = document.createElement("div");
        div.className = divClass;
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.className = "time";
        p.innerHTML = '<p>' + data[i].time+ '</p>'
        div.innerHTML = '<p class="' + authorClass + '">' + data[i].user + "</p>" + '<p class="message"> ' + pravo + "</p>";
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
    sporocilo = ime + " je zacel pogovor"
    hash_pass = sha256(geslo);
    var iv = CryptoJS.enc.Hex.parse("101112131415161718191a1b1c1d1e1f");
    var key = CryptoJS.enc.Hex.parse(hash_pass.toString(CryptoJS.enc.Hex).substr(0, 32));
    var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, String(key), {iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    console.log("KRIPTIRAN SPOROCILO:" + zakodirano_spo);

    // USTVARIMO DATA DA LAHKO POSLEMO
    var data = `{
        "time": "` + formatted + `",
        "user": "` + ime + `",
        "message": "` + zakodirano_spo + `"
    }`;
    
    xhr.send(data); // POSLEMO DATA
}

function sha256(pass){
    var hash = CryptoJS.SHA256(pass);
    console.log("Hash-Geslo:" + hash);
    return hash
}

*/


/*


var id_zadnega // id zadnega sporocila
let link_za_testiranje
let stevec = 0

$(document).ready(function(){

    console.log("Moje ime:" + ime) // IME KI SI GA VPISAL
    console.log("Soba:" + room) // IME SOBE KI SI VPISAL
    encode_room = btoa(room) // ZAKODIRAMO IME SOBE DA LHAKO UPORABIMO
    //console.log("Encode: " + btoa(room))
    //var id_zadnega // id zadnega sporocila
    const Url_get='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages'; // SI SHRANIM LINK ZA DOBIVANJE VSEH SPOROCIL
    const Url_post='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/message' // SHRANIM LINK ZA POSILJANJE SPOROCIL
    let spo = ""
    console.log(ime + " " + room)
    stevilo_prikaza_vseh = 0


    // takoj ko je hocemo vsa sporocila
    $.getJSON(Url_get, function(result){
        console.log(result)
        if(result.length == 0){
            console.log("Ni se bilo sporocil posli da zacenjas pogovor!");
            zacetno_sporocilo(Url_post);
            link_test = Url_get;  // mogoce je tu error
        }
        else{
            // lahko prikazemo sporocila
            link_test = prikaziDobSpo(result)  
            stevilo_prikaza_vseh = 1
        }
        //link_test = prikaziDobSpo(result)
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

        // encrypt message
        sporocilo = document.getElementById("m").value;
        //JSON.stringify({ str }), 'secret'
        var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, encode_room);
        //var zakodirano_spo = CryptoJS.AES.encrypt(JSON.stringify({ sporocilo }), encode_room);



        // USTVARIMO DATA DA LAHKO POSLEMO
        var data = `{
            "time": "` + formatted + `",
            "user": "` + ime + `",
            "message": "` + zakodirano_spo + `"
        }`;
        
        xhr.send(data); // POSLEMO DATA
        document.getElementById("m").value = ""; // SPRAZNIMO TEXTBOX
        
        // POGLEDAM CE SMO ZI PRIKAZALI VSE
        if(stevilo_prikaza_vseh == 0){
            // PRIKAZEMO VSA SPOROCILA

            $.getJSON(Url_get, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
            stevilo_prikaza_vseh = 1 // povecamo na 1
        }
        else{
            // PRIKAZEMO SAMO ZADNIH NEKAJ
            $.getJSON(link_test, function(result){
                link_test = prikaziDobSpo(result) // KLICEMO FUNKCIJO DA JIH PRIKAZE
            })
        }
    })

    setInterval(function(){
        $.getJSON(link_test, function(result){
            link_za_testiranje = link_test
            link_test = prikaziDobSpo(result)
            
        })  

     }, 500);

    $('#btn').click(function(){
        // GUMB ZA PRIKAZ VSEH SPOROCIL
        $.getJSON(Url_get, function(result){
           link_test = prikaziDobSpo(result)
       })
    })

    $('#btn_enega').click(function(){
        // GUMB ZA PRIKAZ ENEGA
        $.getJSON(link_test, function(result){
            link_test = prikaziDobSpo(result)
       })
    })
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
        spo = data[i].message
        decrypted = CryptoJS.AES.decrypt(spo, encode_room);
        console.log("spo: " + spo)
        console.log("de: " + decrypted)
        console.log("PRAVO: " + decrypted.toString(CryptoJS.enc.Utf8))
        pravo = decrypted.toString(CryptoJS.enc.Utf8)
        const div = document.createElement("div");
        div.className = divClass;
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.className = "time";
        p.innerHTML = '<p>' + data[i].time+ '</p>'
        div.innerHTML = '<p class="' + authorClass + '">' + data[i].user + "</p>" + '<p class="message"> ' + pravo + "</p>";
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
    sporocilo = ime + " je zacel pogovor"
    var zakodirano_spo = CryptoJS.AES.encrypt(sporocilo, encode_room);

    // USTVARIMO DATA DA LAHKO POSLEMO
    var data = `{
        "time": "` + formatted + `",
        "user": "` + ime + `",
        "message": "` + zakodirano_spo + `"
    }`;
    
    xhr.send(data); // POSLEMO DATA
}

*/