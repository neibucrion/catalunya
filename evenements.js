var evenements = {};
var vars = {};
var evenementEnCours = "";

class ActionError extends Error {
  constructor(...params) {
    super(...params);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, ActionError);
    }
    this.name = 'ActionError';
  }
}

function chargeEvenements(jsonBrut)
{
  try
  {
    evenements = JSON.parse(jsonBrut);
    joueUnEvenement("start");
  }
  catch(e)
  {
    var message = `Problème à l'ouverture du fichier d'evenements' : ${e}`;
    console.error(message);
  }
}

function joueUnEvenement(nomevenement)
{
  if (Object.keys(evenements).indexOf(nomevenement) == -1 && nomevenement != "none")
  {
    throw new ActionError(`Evenement '${nomevenement}' inconnu.`);
  }
  else
  {
    joueLEvenement(nomevenement);
  }
}

function joueLEvenement(nomevenement)
{
  if (nomevenement != "none")
  {
    evenementEnCours = nomevenement;
    joueLesActions(evenements[nomevenement].actions);
  }
}

function joueLesActions(actions)
{
  for (var action of actions)
  {
    switch (action.type)
    {
      case "porte":
        modifiePorte(action);
        break;

      case "perso":
        verifieMouvementPerso(action.perso, action.destination, deplacePerso);
        break;

      case "variable":
        modifieVariable(action);
        break;

      case "modifEvenement":
        modifieEvenement(action);
        break;

      case "changeContexte":
        changeContexte(action);
        break;

      case "scene":
        sceneActuelle = action.scene;
        loadJSON(`scene/${action.scene}`, chargeUneScene);
        break;

      case "evenement":
        joueEvenementInterieur(action.evenement);
        break;

      case "condition":
        analyseUneCondition(actions.slice(actions.indexOf(action), actions.length));
        break;

      case "log":
        evenementLog(action);
        break;
    }
  }
}

function joueEvenementInterieur(nomevenement)
{
  try
  {
    joueUnEvenement(nomevenement);
  }
  catch(e)
  {
    var message = `Dans l'événement '${evenementEnCours}' problème à l'ouverture de l'événement  : ${e}`;
    console.error(message);
  }
}

function analyseUneCondition(blocAnalyse)
{
  if (blocAnalyse[0].condition == "if")
  {
    var reponse = trouveBlocConditions(blocAnalyse);
    if (reponse != null)
    {
      joueLesActions(reponse.actions);
    }
  }
}

function modifiePorte(action)
{
  try
  {
    var porte = trouveUnePorte(action.porte);
    porte.etat = action.etat;
    chargeDirectionsPossibles();
  }
  catch (e)
  {
    console.error(e);
  }
}

function trouveUnePorte(acces)
{
  var porte = null;
  for (var pindex in portes)
  {
    var ptest = portes[pindex];
    if ((ptest.entree == acces.entree && ptest.sortie == acces.sortie)||
        (ptest.entree == acces.sortie && ptest.sortie == acces.entree))
        {
          porte = ptest;
          break;
        }
  }
  if (porte == null)
  {
    throw new ActionError(`Porte de '${acces.entree}' à '${acces.sortie}' inconnue dans l'événement '${evenementEnCours}'.`);
  }
  return porte;
}

function verifiePerso(nomperso, objectif, suite)
{
  try
  {
    if (Object.keys(persos).indexOf(nomperso) == -1)
    {
      throw new ActionError(`Personnage '${nomperso}' inconnu dans l'événement '${evenementEnCours}'.`);
    }
    else
    {
      suite(nomperso, objectif);
    }
  }
  catch (e)
  {
    console.error(e);
  }
}

function verifieMouvementPerso(nomperso, objectif, suite)
{
  try
  {
    if (Object.keys(persos).indexOf(nomperso) == -1)
    {
      throw new ActionError(`Personnage '${nomperso}' inconnu dans l'événement '${evenementEnCours}'.`);
    }
    else if (objectif != "nowhere" && Object.keys(lieux).indexOf(objectif) == -1)
    {
      throw new ActionError(`Lieu '${objectif}' inconnu dans l'événement '${evenementEnCours}'.`);
    }
    else {
      suite(nomperso, objectif);
    }
  }
  catch (e)
  {
    console.error(e);
  }
}

function deplacePerso(nomperso, destination)
{
  var perso = persos[nomperso];
  if (perso.position != "nowhere")
  {
    var occupants = lieux[perso.position].occupants;
    occupants.splice(occupants.indexOf(nomperso));
  }
  perso.position = destination;
  if (perso.position != "nowhere")
  {
    lieux[perso.position].occupants.push(nomperso);
  }
  chargePersosPresents();
}

function modifieVariable(action)
{
  try
  {
    if (Object.keys(vars).indexOf(action.variable) == -1)
    {
      throw new ActionError(`Variable '${action.variable}' inconnue dans l'événement '${evenementEnCours}'.`);
    }
    else {
      if (action.aleatoire)
      {
        vars[action.variable] = action.valeurs[getRandomInt(2)];
      }
      else
      {
        vars[action.variable] = action.valeur;
      }
    }

  }
  catch(e)
  {
    console.error(e);
  }
}

function modifieEvenement(action)
{
  switch (action.element)
  {
    case "lieu":
      modifieEvenementLieu(action);
      break;

    case "perso":
      verifiePerso(action.perso, action.evenement, modifieEvenementPerso);
      break;
  }
}

function modifieEvenementLieu(action)
{
  if (Object.keys(lieux).indexOf(action.lieu) == -1)
  {
    throw new ActionError(`Lieu '${action.lieu}' inconnu dans l'événement '${evenementEnCours}'.`);
  }
  else
  {
    var lieu = lieux[action.lieu];
    lieu.evenement = action.evenement;
  }
}

function modifieEvenementPerso(nomperso, evenement)
{
  persos[nomperso].evenement = evenement;
}

function changeContexte(action)
{
  if (Object.keys(lieux).indexOf(action.lieu) == -1)
  {
    throw new ActionError(`Lieu '${action.lieu}' inconnu dans l'événement '${evenementEnCours}'.`);
  }
  else
  {
    var lieu = lieux[action.lieu];
    lieu.contexte = action.contexte;
  }
}

function evenementLog(action)
{
  var logfinal = action.log;
  if (Object.keys(action).indexOf("variable") != -1)
  {
    logfinal = `${action.log} ${vars[action.variable]}`;
  }
  console.log(logfinal);
}

function getRandomInt(max)
{
  return Math.floor(Math.random() * Math.floor(max));
}
