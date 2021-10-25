const vTranslate = require('@vitalets/google-translate-api');
var isLanguageSupported = require('./node_modules/@vitalets/google-translate-api/languages').isSupported
const express = require('express');
const ISO6391 = require('iso-639-1');
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const Translation = require('./Model/translation')
const simillarLangCode = require('./similarLangCodes')
const app = express();
dotenv.config({ path: "./config.env" });
app.use(express.json());
  
const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB, {useNewUrlParser: true,useUnifiedTopology: true })
  .then(() => {
    console.log("DB connection successful");
  });

app.get('/:from/:to', async (req, res) => {

  try { 
    let { textToTranslate } = req.body;
    let { from, to } = req.params;
    //converting language name to its ISO-code
    from = ISO6391.getCode(from);
    to = ISO6391.getCode(to);


    //checking if data already exists in db or not
    let data = await Translation.findOne({ 'textToTranslate.from': from, 'textToTranslate.text': textToTranslate })//, 'translation.to': to })

    if (data) {
        //
      let cacheTo = data.smartTranslation.find(st =>{ return st.to === to})

        if(cacheTo){
          res.send(cacheTo.trans)
          console.log('data from db');  
        }else res.send('Language may not be supported by the translator api')
    } 


    //if not, getting the data from api and storing it in database
    else {

      const text = await vTranslate(textToTranslate, { to });
      res.send(text.text);

      console.log('Data coming from api')

      let translation = new Translation()
      translation.textToTranslate.from = from
      translation.textToTranslate.text = textToTranslate

      translation.translation.to = to;
      translation.translation.trans = text.text
      let savedDAta = await translation.save()


        /// 👇 smartCaching

        //get array all the codes of simillar languages
      let similarCodes = simillarLangCode(ISO6391.getName(to));


      similarCodes.forEach(async code => {
   
        if(isLanguageSupported(code))
        vTranslate(textToTranslate, {to: code}).then(async res=>{
          let smartTrans = {
            from ,
            to:code,
            trans : res.text
          }
          
          //update the data in database
           await Translation.findByIdAndUpdate(savedDAta._id , 
            {$push : {smartTranslation : smartTrans} }   
          )
       })

      })

    }


  } catch (err) {
      res.status(404).json({
      status:'Fail',
      message:err.message
    })
  }

})

//get all the data

app.get('/all',async(req,res)=>{
try{
  let data = await Translation.find();
  res.status(200).json({
    results:data.length,
    status:'Success',
    data
  })
}catch(err){
  res.status(404).json({
    status:'Fail',
    message:err.message
  })
}


})


//delete all the data
app.delete('/',async(req,res)=>{
 try {
    await Translation.deleteMany({})
      res.status(200).send('All Data Deleted Successfully')
}catch(err){
  res.status(404).json({
    status:'Fail',
    message:err.message
  })
}
})

app.listen(5000, () => {
  console.log('server is running at port 5000');
})