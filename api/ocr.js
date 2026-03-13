import Tesseract from "tesseract.js"
import formidable from "formidable"

export const config = {
  api: {
    bodyParser: false
  }
}

function parseForm(req){

  const form = formidable()

  return new Promise((resolve,reject)=>{

    form.parse(req,(err,fields,files)=>{

      if(err) reject(err)

      resolve(files)

    })

  })

}

function validateThaiID(id){

  if(id.length !== 13) return false

  let sum = 0

  for(let i=0;i<12;i++){
    sum += parseInt(id[i]) * (13-i)
  }

  const digit = (11-(sum%11)) % 10

  return digit === parseInt(id[12])
}

export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({error:"method not allowed"})
  }

  try{

    const files = await parseForm(req)

    const image = files.image.filepath

    const result = await Tesseract.recognize(
      image,
      "eng"
    )

    const text = result.data.text

    const match = text.match(/\d{13}/)

    if(match){

      const id = match[0]

      return res.json({
        id_number:id,
        valid:validateThaiID(id),
        raw:text
      })

    }

    res.json({
      success:false,
      message:"no id found"
    })

  }catch(e){

    res.status(500).json({
      error:e.toString()
    })

  }

}