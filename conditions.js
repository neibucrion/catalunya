function analyseConditions(blocGeneral)
{
  var reponses = [];
  var suivant = 0;
  for (var bgIndex in blocGeneral)
  {
      var element = blocGeneral[bgIndex];
      if (element.type == "condition")
      {
        if (element.condition == "if")
        {
          var blocAnalyse = blocGeneral.slice(bgIndex, blocGeneral.length);
          var reponsePossible = trouveBlocConditions(blocAnalyse);
          if (reponsePossible != null)
          {
            reponses.push(reponsePossible);
          }
        }
      }
      else
      {
        reponses.push(element);
      }
  }
  return reponses;
}

function trouveBlocConditions(blocAnalyse)
{
  var blocFinal = [];
  for (var bindex in blocAnalyse)
  {
    var element = blocAnalyse[bindex];
    if (bindex == 0)
    {
      blocFinal.push(element);
    }
    else if (element.type == "condition"
            && (element.condition == "elif")
            || element.condition == "else")
    {
      blocFinal.push(element);
      if (element.condition == "else")
      {
        break;
      }
    }
    else
    {
      break;
    }
  }
  return trouveReponseBlocFinal(blocFinal);
}

function trouveReponseBlocFinal(blocFinal)
{
  var reponse = null;
  for (var element of blocFinal)
  {
    if (element.condition != "else")
    {
      if (eval(element.enonce))
      {
        reponse = element;
        break;
      }
    }
    else
    {
      reponse = element;
    }
  }
  return reponse;
}
