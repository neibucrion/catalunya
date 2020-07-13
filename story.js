var pj = "";
var lieuActuel = "";
var persos = {};
var lieux = {};
var portes = [];

function lanceJeu()
{
  //lang = navigator.language;
  loadJSON("scenario", chargeScenario);
}

function loadJSON(filename, callback)
{
    var filename = `json/${filename}.json`;
    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', filename, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200")
          {
            callback(xobj.responseText);
          }
    };
    xobj.send(null);
 }

 function chargeScenario(jsonBrut)
 {
    var obj;
    try
    {
     obj = JSON.parse(jsonBrut);
    }
    catch(e)
    {
      var message = `Problème à l'ouverture du scénario : ${e}`;
      console.error(message);
    }
    persos = obj.persos;
    vars = obj.variables;
    pj = obj.pj;
    lieuActuel = persos[pj].position;
    document.getElementById('pj').innerHTML = pj;
    loadJSON("lieux", chargeLieux);
 }

 function chargeLieux(jsonBrut)
 {
    var obj;
    try
    {
      obj = JSON.parse(jsonBrut);
    }
    catch(e)
    {
      var message = `Problème à l'ouverture du fichier de lieux : ${e}`;
      console.error(message);
    }
    lieux = obj.lieux;
    portes = obj.doors;
    placeLesPersos();
    changeLieu(lieuActuel);
    loadJSON("evenements", chargeEvenements);
 }

 function placeLesPersos()
 {
   for (var p in persos)
   {
     var lieuPerso = persos[p].position;
     if (lieuPerso != "nowhere")
     {
       var lieuOccupe = lieux[lieuPerso];
       lieuOccupe.occupants.push(p);
     }
   }
 }

 function changeLieu(nouveauLieu)
 {
    var occupants = lieux[lieuActuel].occupants;
    occupants.splice(occupants.indexOf(pj),1);
    lieuActuel = nouveauLieu;
    var lieu = lieux[lieuActuel];
    document.getElementById('lieuActuel').innerHTML = lieu.title;
    var descriptions = analyseConditions(lieu.descriptions);
    document.getElementById('description').innerHTML = descriptions[0].text;
    document.getElementById('scene').innerHTML = lieu.contexte;
    lieu.occupants.push(pj);
    chargePersosPresents();
    chargeDirectionsPossibles();
    try
    {
      joueUnEvenement(lieu.evenement);
    }
    catch(e)
    {
      var message = `Problème à l'ouverture de l'événement du lieu '${lieuActuel}' : ${e}`;
      console.error(message);
    }
 }

 function chargePersosPresents()
 {
   document.getElementById('PNJPresents').innerHTML = "";
   lieux[lieuActuel].occupants.forEach((item, i) => {
     if (item != pj)
     {
       var lienHTML = `<a onclick="parleAUnPerso('${item}')" href="#">${item}</a><br/>`;
       document.getElementById('PNJPresents').innerHTML += lienHTML;
     }
   });
 }

 function chargeDirectionsPossibles()
 {
     document.getElementById('liens').innerHTML = "";
     portes.forEach((item, i) => {
         if (item.entree == lieuActuel && item.etat)
         {
             ecritLien(item.sortie);
         }
         else if (item.sortie == lieuActuel && item.etat)
         {
             ecritLien(item.entree);
         }
     });
 }

 function ecritLien(direction)
 {
   var titreLieu = lieux[direction].title;
   var lienHTML = `<a onclick="changeLieu('${direction}')" href="#">${titreLieu}</a><br/>`;
   document.getElementById('liens').innerHTML += lienHTML;
 }

function parleAUnPerso(nomperso)
{
  try
  {
    joueUnEvenement(persos[nomperso].evenement);
  }
  catch(e)
  {
    var message = `Problème à l'ouverture de l'événement du perso '${nomperso}' : ${e}`;
    console.error(message);
  }

}
