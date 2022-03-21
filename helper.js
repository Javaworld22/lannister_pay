
var mySort = (values)=>{
    values.sort(function(a,b){
        return a - b
    })
    //console.log(values)
    return values
}

var fcs = (val1,val3,customer) => {
    let spec,count;
    //console.log('Val3 '+val3)
    //console.log('Val2 '+val2)
loop1:
  for(var i=0;i<val3.length;i++){
    //console.log('Val33 '+val3[i].charAt(0))
      if(val1 == val3[i].charAt(0)){
            spec = val3[i]
            count = i
            break loop1
      }
  }
var val31 = val3.splice(count,1)
//var  val21 = delete val2[count]
   //console.log('Val31 '+val3)
  let compute =  compute_type(customer,val31)

  return {'spec': spec, 'newValue1': val3, 'valid':compute.res,'feeid':compute.feeid,
      'charge':compute.charge,'settle':compute.settle,'appliedfee':compute.appliedfee,'error':compute.error}
}

var compute_type = (customer,spec) => {
    let first = false, second = false, third = false,fourth = false,fifth = false,sixth = false
    let errormsg
    let appliedfee,charge,settleamount
    //console.log('print spec here '+spec)
    let base
    if(customer.CurrencyCountry == customer.Country)
        base = 'LOCL'
    else
        base = 'INTL'

    let feeds = spec.toString().split(' ')

    if(feeds[1] == customer.currency)
       first = true
    if(feeds[2] == base || feeds[2] == '*')
        second = true
    if(feeds[3] == customer.type || feeds[3] == '*') //credit-card,debitcard,bankaccount,ussd,wallet-id
      third = true
    if(feeds[4] == customer.brand || feeds[4] == '*') // mastercard, visacard
        fourth = true
    if(feeds[4] == customer.issuer || feeds[4] == '*') // mtn,glo,airtel,bank name, wallet name, etc
        fifth = true

    if(feeds[5] == 'PERC'){
        appliedfee =  /**customer.amount - **/((customer.amount * feeds[6])/100)
        if(customer.bearfee){
            settleamount = customer.amount
            charge = (customer.amount*1) + appliedfee
        }else{
            settleamount = customer.amount - (appliedfee*1)
            charge = (customer.amount*1)
        }
         // console.log()
    }else if(feeds[5] == 'FLAT'){
        appliedfee = feeds[6]
        if(customer.bearfee){
        settleamount = customer.amount
        charge = (customer.amount*1) + (appliedfee*1)
        }else{
            settleamount = customer.amount - (appliedfee*1)
        charge = (customer.amount*1)
        }

    }else if(feeds[5] == 'FLAT_PERC'){
        let perc = feeds[6].toString().split(':')
        //console.log(customer.amount)
        let relValue = ((perc[1] * customer.amount)/100)
        relValue = relValue + (perc[0]*1)
       // let relValue1 = ((customer.amount) - relValue)
        appliedfee = relValue
        if(customer.bearfee){
            settleamount = customer.amount
            charge = (customer.amount*1) + (appliedfee*1)
        }else{
            settleamount = customer.amount - (appliedfee*1)
            charge = (customer.amount*1)
        }
        //console.log(relValue1)
        //console.log(relValue)
    }
      if(!first)
         errormsg = 'No fee configuration for '+ customer.currency+ ' transaction'
      else if(!second)
         errormsg = 'No fee configuration for '+ base+ ' transaction'
      else if(!third)
         errormsg = 'No fee configuration for '+ customer.type+ ' transaction'
      else if(!fourth)
         errormsg = 'No fee configuration for '+ customer.brand+ ' transaction'
      else if(!fifth)
         errormsg = 'No fee configuration for '+ customer.issuer+ ' transaction'

     if(first && second && third && fourth && fifth)
        return {'res':true,'feeid':feeds[0],'settle':settleamount,'appliedfee':appliedfee,'charge':charge,'error':errormsg}
    else
      return {'res':false,'feeid':feeds[0],'settle':settleamount,'appliedfee':appliedfee,'charge':charge,'error':errormsg}


}

module.exports ={mySort,fcs,compute_type}