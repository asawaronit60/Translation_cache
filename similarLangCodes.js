const ISO6391 = require('iso-639-1');
const CountryLanguage = require('country-language');
var countries = require('country-data').countries


// module.exports =
 function  smartTranslationLanguageCode(to){
  let simillar = [];

let countryName = CountryLanguage.getLanguage(ISO6391.getCode(to))

    if(!countryName.countries.length==0){
     countryName =  countryName.countries.map(country =>{ return country.name })
    }
    else {
      countryName =  countryName.langCultureMs[0].displayName.split('-')[1].trim()
      countryName = [countryName]
    }

    countries.all.forEach(country=>{
       
        if(countryName.includes(country.name)){
  
        CountryLanguage.getCountryLanguages(country.alpha2).forEach(el =>{
          simillar.push(el.iso639_1)
        })
    }
  })

 let  uniqueArray = simillar.filter(function(item, pos) {
    return simillar.indexOf(item) == pos && item !== '';
})

  return uniqueArray
}   


module.exports = smartTranslationLanguageCode