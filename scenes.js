var scene = {};
var sceneActuelle = "";
var evenementScene = "";

class SceneError extends Error {
  constructor(...params) {
    super(...params);

    if(Error.captureStackTrace) {
      Error.captureStackTrace(this, SceneError);
    }
    this.name = 'SceneError';
  }
}

function chargeUneScene(jsonBrut)
{
  try
  {
    scene = JSON.parse(jsonBrut);
  }
  catch(e)
  {
    var message = `Problème à l'ouverture de la scène ${sceneActuelle} : ${e}`;
    console.error(message);
  }
  document.getElementById('container').style.display = "none";
  document.getElementById('scene').innerHTML = "";
  afficheNouveauParagraphe("start");
}

function afficheNouveauParagraphe(nomParagraphe)
{
  try
  {
    if (Object.keys(scene).indexOf(nomParagraphe) == -1)
    {
      throw new SceneError(`Paragraphe '${nomParagraphe}' inconnu dans la scene '${sceneActuelle}'.`);
    }
    else
    {
      afficheParagraphe(scene[nomParagraphe])
    }
  }
  catch(e)
  {
    console.error(e);
  }
}

function afficheParagraphe(paragraphe)
{
  document.getElementById('scene').innerHTML += `<p>${paragraphe.text}</p>`;
  analyseLiens(paragraphe.links);
}

function analyseLiens(liens)
{
  liens = analyseConditions(liens);
  var lienfinal = liens[0];
  switch (lienfinal.type) {
    case "question":
      afficheUneQuestion(lienfinal);
      break;

    case "direct":
      continueLecture(lienfinal.next.paragraphe, "none", "", "");
      break;

    case "condition":
      analyseLiens(lienfinal.links);
      break;

    default:
      evenementScene = lienfinal.evenement;
      afficheFinScene();
      break;
  }
}

function afficheUneQuestion(question)
{
  var lienHTML = `<p>${question.question}</p>`;
  document.getElementById('options').innerHTML = lienHTML;
  analyseLesOptions(question.options);
}

function analyseLesOptions(options)
{
  options = analyseConditions(options);
  for (var option of options)
  {
    if (option.type == "condition")
    {
      analyseLesOptions(option.options);
    }
    else
    {
      var lienParagraphe = ecritLienParagraphe(option.next, option.text);
      var lienHTML = `<a onclick="continueLecture(${lienParagraphe})" href="#">${option.text}</a><br/>`;
      document.getElementById('options').innerHTML += lienHTML;
    }
  }
}

function ecritLienParagraphe(next, texteLien)
{
  var retour = "";
  if (next.variable != "none")
  {
    retour = `'${next.paragraphe}','${next.variable}','${next.valeur}','${texteLien}'`;
  }
  else
  {
    retour = `'${next.paragraphe}', 'none', '', '${texteLien}'`;
  }
  return retour;
}

function continueLecture(nomparagraphe, variable, valeur, texteLien)
{
  if (variable != "none")
  {
    vars[variable] = valeur;
  }
  if (texteLien != "")
  {
    document.getElementById('scene').innerHTML += `<p>${texteLien}</p>`;
  }
  afficheNouveauParagraphe(nomparagraphe);
}

function afficheFinScene()
{
  document.getElementById('options').innerHTML = '<a onclick="finitLaScene()" href="#">Finish the scene</a><br/>';
}

function finitLaScene()
{
  document.getElementById('container').style.display = "block";
  document.getElementById('scene').innerHTML = "";
  document.getElementById('options').innerHTML = "";
  try
  {
    joueUnEvenement(evenementScene);
  }
  catch(e)
  {
    var message = `Dans la scene '${sceneActuelle}' problème à l'ouverture de l'événement  : ${e}`;
    console.error(message);
  }
}
