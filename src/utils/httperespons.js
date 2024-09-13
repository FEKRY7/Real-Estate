const First = (res,data,statuscod,statustext)=>{
    res.status(statuscod).json({
        "status":statustext,
        "data":data
    })
}
    
const Second = (res,data,statuscod,statustext)=>{
    res.status(statuscod).json({
        "status":statustext,
        "data": {
            "product":data
        }
    })
}
    
const Third = (res,masseg,statuscod,statustext)=>{
    res.status(statuscod).json({
        "status":statustext,
        "masseg":masseg
    })
}
    
module.exports={
    First,
    Second,
    Third
}