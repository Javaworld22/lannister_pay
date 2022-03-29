const express = require('express');
const bodyParser = require ('body-parser')
const session = require('express-session');
const mySort = require('./helper')
const MongoClient = require('mongodb').MongoClient;


var app = express()
const port = process.env.PORT || 3005

const connectionString = 'mongodb+srv://Javaworld:***************@cluster0.ohjvp.mongodb.net/cluster0?authSource=admin&replicaSet=atlas-k0ow6z-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true'


// app.use(redirectSSL.create({
//     enabled: process.env.NODE_ENV === 'production'
//   }))
// var options = {
//     inflate: true,
//     limit: '100kb',
//     type: 'application/octet-stream'
// }
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
//app.use(bodyParser.raw(options))
app.use(session({secret: 'javaworld',saveUninitialized: true,resave: true, cookie: { maxAge: 6000000 }}));


MongoClient.connect(connectionString, { useUnifiedTopology: true })
.then(client => {
    console.log('Connected to Database')
  const db = client.db('aircrack')
    console.log('Passed creating db')
    const values = db.collection('lannister_pay')
      console.log('Created collection')
     // values.createIndex({"email": 1, }, { unique: true })


app.post('/fees', (req,res) => {
    console.log(req.body)
    let regex = /\\n/
    let feed_id = []
    let feed_currency = []
    let feed_locale = []
    let feed_entity = []
    let feed_property = []
    let fee_type = []
    let feed_value = []
    let transactions = 'admin'
    const {FeeConfigurationSpec} = req.body
    var feeds = FeeConfigurationSpec.split('\n')
    console.log(feeds);




    for(i=0;i<feeds.length;i++){
        let entity = feeds[i].replace('(',' ').replace(')','').split(' ')
        feed_id.push(entity[0])
        feed_currency.push(entity[1])
        feed_locale.push(entity[2])
        feed_entity.push(entity[3])
        feed_property.push(entity[4])
        fee_type.push(entity[7])
        feed_value.push(entity[8])

    }

    values.findOneAndUpdate( {transactions: 'admin'}, {$set: {feed_id, feed_currency, feed_locale,
        feed_entity, feed_property,fee_type,feed_value}})
      .then(result => {

    req.session.feed_id = feed_id
    req.session.feed_currency = feed_currency
    req.session.feed_locale = feed_locale
    req.session.feed_entity = feed_entity
    req.session.feed_property = feed_property
    req.session.fee_type = fee_type
    req.session.feed_value = feed_value


    res.json({'Status': 'Ok'})
})
.catch(error => console.error('Database error occured '+error))
})


app.post('/compute-transaction-fee', (req,res) => {
    let {ID,Amount,Currency,CurrencyCountry,Customer,PaymentEntity} = req.body
    //  console.log(ID)
    //  console.log(Amount)
    //  console.log(Currency)
    //  console.log(CurrencyCountry)
    //  console.log(Customer.ID)
    //  console.log(PaymentEntity.Type)

    let feed_id = req.session.feed_id
    let feed_currency = req.session.feed_currency
    let feed_locale = req.session.feed_locale
    let feed_entity = req.session.feed_entity
    let feed_property = req.session.feed_property
    let fee_type = req.session.fee_type
    let feed_value = req.session.feed_value
    let compute_avg = []
    let compute_first = []
    //let compute_first1 = []
    let compute_sorted = []

    if(typeof feed_id !== 'undefined' && typeof feed_currency !== 'undefined'){

        for(i=0;i<feed_id.length;i++){
            let first = feed_id[i]+' '+feed_currency[i]+' '+feed_locale[i]+' '+feed_entity[i]+' '+feed_property[i]+
            ' '+fee_type[i]+' '+feed_value[i]
            //console.log(first)
            let numIt = first.split('*')
            compute_avg.push((numIt.length-1)+first)
            compute_first.push(numIt.length-1)
        }

        compute_sorted = mySort.mySort(compute_first)
        //console.log(compute_sorted)
        let customer = {'amount':Amount,'currency':Currency,'currencycountry':CurrencyCountry,
          'issuer':PaymentEntity.Issuer,'brand':PaymentEntity.Brand,'type':PaymentEntity.Type,
          'country':PaymentEntity.Country,'bearfee': Customer.BearsFee}
          let transactions
 loop1:
    for(i=0;i<compute_sorted.length;i++){
        let compute = mySort.fcs(compute_sorted[i],compute_avg,customer)
        //compute_first1 = compute.newValue2
        compute_avg = compute.newValue1

        transactions = compute
        //console.log('compute avg '+compute_avg)
        if(transactions.valid)
            break loop1
    }
    //console.log('Already stored here ')
    if(transactions.valid)
    res.json({'AppliedFeeID': transactions.feeid.toString().slice(1),'ChargeAmount':transactions.charge,
    'SettlementAmount': transactions.settle,'AppliedFeeValue': transactions.appliedfee})
    else
    res.status(401).json({'Error': transactions.error})
    return

    }else{
    values.find({'transactions': 'admin'}).toArray()
    .then(result => {
            //console.log(result)
            feed_id = result[0].feed_id
            feed_currency = result[0].feed_currency
            feed_locale = result[0].feed_locale
            feed_entity = result[0].feed_entity
            feed_property = result[0].feed_property
            fee_type = result[0].fee_type
            feed_value = result[0].feed_value

            req.session.feed_id = feed_id
            req.session.feed_currency = feed_currency
            req.session.feed_locale = feed_locale
            req.session.feed_entity = feed_entity
            req.session.feed_property = feed_property
            req.session.fee_type = fee_type
            req.session.feed_value = feed_value

            //console.log(result[0].feed_id)
    for(i=0;i<feed_id.length;i++){
        let first = feed_id[i]+' '+feed_currency[i]+' '+feed_locale[i]+' '+feed_entity[i]+' '+feed_property[i]+
        ' '+fee_type[i]+' '+feed_value[i]
        console.log(first)
        let numIt = first.split('*')
        compute_avg.push((numIt.length-1)+first)
        compute_first.push(numIt.length-1)
    }
        //console.log(' comp '+compute_avg)
        //console.log('comp1 '+compute_first)
        //compute_first1 = compute_first
        compute_sorted = mySort.mySort(compute_first)
        console.log(compute_sorted)
        let customer = {'amount':Amount,'currency':Currency,'currencycountry':CurrencyCountry,
          'issuer':PaymentEntity.Issuer,'brand':PaymentEntity.Brand,'type':PaymentEntity.Type,
          'country':PaymentEntity.Country,'bearfee': Customer.BearsFee}
          let transactions
 loop1:
    for(i=0;i<compute_sorted.length;i++){
        let compute = mySort.fcs(compute_sorted[i],compute_avg,customer)
        //compute_first1 = compute.newValue2
        compute_avg = compute.newValue1
        //console.log('compute first '+compute_first1)
        transactions = compute
        //console.log('compute avg '+compute_avg)
        //console.log('Transaction '+transactions.valid)
        if(transactions.valid)
            break loop1
    }



if(transactions.valid)
    res.json({'AppliedFeeID': transactions.feeid.toString().slice(1),'ChargeAmount':transactions.charge,
'SettlementAmount': transactions.settle,'AppliedFeeValue': transactions.appliedfee})
else
res.status(401).json({'Error': transactions.error})
return
    })
    .catch(error => console.error('Cannot retrieve from Database '+error))
}


})




app.listen(port, ()=>{console.log('Starting the server at port ' +port)})

})
.catch(error =>
    {
      console.error('Error occurred at database')
      console.error(error)

    })
