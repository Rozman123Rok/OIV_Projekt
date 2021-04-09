var id_zadnega // id zadnega sporocila
let link_za_testiranje

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

    //var Url_samo_eno //='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages/from_id/' + id_zadnega // LINK ZA DOBIVANJE SAMO ENEGA SPOROCILA
    stevilo_prikaza_vseh = 0
    let link_test
    let prej_link
    
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

        // USTVARIMO DATA DA LAHKO POSLEMO
        var data = `{
            "time": "` + formatted + `",
            "user": "` + ime + `",
            "message": "` + document.getElementById("m").value + `"
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

        const div = document.createElement("div");
        div.className = divClass;
        const li = document.createElement("li");
        const p = document.createElement("p");
        p.className = "time";
        p.innerHTML = '<p>' + data[i].time+ '</p>'
        div.innerHTML = '<p class="' + authorClass + '">' + data[i].user + "</p>" + '<p class="message"> ' + data[i].message + "</p>";
        div.appendChild(p);
        li.appendChild(div);

        document.getElementById("messages").appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
    }

    // SI SHRANIM ID ZADNEGA
    if(data.length != 0){
        id_zadnega = data[data.length-1].id;
        Url_samo_eno='https://oiv.rmk.cloud/api/v1/room/' + encode_room + '/messages/from_id/' + id_zadnega + ''// LINK ZA DOBIVANJE SAMO ENEGA SPOROCILA
    }


    
    return Url_samo_eno
}
