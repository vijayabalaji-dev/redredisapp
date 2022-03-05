const express = require('express')
const path = require('path')
const bodyparser = require('body-parser')
const redis = require('redis')
const methodOverride = require('method-override')
const exphbs = require('express-handlebars')
const fs = require('fs')
const parse = require('csv-parse')
let data = ''
const parser = parse.parse({columns : true}, (err, record) => {
	data = record
	console.log(data[0])
})
fs.createReadStream('churn.csv').pipe(parser)
const port  = 3000
const app = express()


//redis connection
const client = redis.createClient()
client.connect()
client.on('connect', () => {
	console.log("Connected to Redis")
})

//view engine configuration
app.engine('handlebars', exphbs.engine())
app.set('view engine','handlebars')
app.set('views', './views')




//app confgurations

app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())
app.use(express.static(path.join(__dirname,'public')))



//routes

app.get('/',async  (req,res) => {
    let cids = []
	for(let j = 0;j < data.length;j++)
	{
		cids.push(data[j].customerID)
	}
	// for(let i = 0;i < data.length;i++)
	// {
	// 	await client.hSet(cids[i],'customerID',data[i].customerID)
	// 	await client.hSet(cids[i],'gender',data[i].gender)
	// 	await client.hSet(cids[i],'SeniorCitizen',data[i].SeniorCitizen)
	// 	await client.hSet(cids[i],'Partner',data[i].Partner)
	// 	await client.hSet(cids[i],'Dependents',data[i].Dependents)
	// 	await client.hSet(cids[i],'tenure',data[i].tenure)
	// 	await client.hSet(cids[i],'PhoneService',data[i].PhoneService)
	// 	await client.hSet(cids[i],'MultipleLines',data[i].MultipleLines)
	// 	await client.hSet(cids[i],'InternetService',data[i].InternetService)
	// 	await client.hSet(cids[i],'OnlineSecurity',data[i].OnlineSecurity)
	// 	await client.hSet(cids[i],'OnlineBackup',data[i].OnlineBackup)
	// 	await client.hSet(cids[i],'DeviceProtection',data[i].DeviceProtection)
	// 	await client.hSet(cids[i],'TechSupport',data[i].TechSupport)
	// 	await client.hSet(cids[i],'StreamingTV',data[i].StreamingTV)
	// 	await client.hSet(cids[i],'StreamingMovies',data[i].StreamingMovies)
	// 	await client.hSet(cids[i],'Contract',data[i].Contract)
	// 	await client.hSet(cids[i],'PaperlessBilling',data[i].PapperlessBilling)
	// 	await client.hSet(cids[i],'PaymentMethod',data[i].PaymentMethod)
	// 	await client.hSet(cids[i],'MonthlyCharges',data[i].MonthlyCharges)
	// 	await client.hSet(cids[i],'TotalCharges',data[i].TotalCharges)
	// 	await client.hSet(cids[i],'Churn',data[i].Churn)
	// }
	// console.log(cids[0])

	
	res.render('index')
})

app.post('/user', async (req, res) => {
    
  	
	let id = req.body.usid
	let data = await client.hGetAll(id)
	console.log(typeof data)
	if(data.name)
	{
	res.render('user',{
		user : data
	})
    }
    else
    {
       res.render('user',{
		error : true
	})
    }
 
})

app.get('/add', (req,res) => {
	res.render('adduser')
})

app.post('/add/user', async (req,res) => {
	let id = req.body.id
	let name = req.body.name
	let email = req.body.email
	let phone = req.body.phone

	await client.hSet(id,'name',name)
	await client.hSet(id,'email',email)
	await client.hSet(id,'phone',phone)

	res.redirect('/')
})
app.listen(port, () => {
	console.log('App is running')
})




module.exports = app

