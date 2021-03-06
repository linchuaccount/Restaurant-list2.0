const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const Restaurant = require('./models/restaurant')
const bodyParser = require('body-parser')
const app = express()

mongoose.connect('mongodb://localhost/restaurant-list', { useNewUrlParser: true, useUnifiedTopology: true })

const db = mongoose.connection
db.on('error', () => {
  console.log('mogodb error!')
})
db.once('open', () => {
  console.log('mongodb connected!')
})

app.engine('hbs', exphbs({ defaultLayout: 'main', extname: '.hbs'}))
app.set('view engine', 'hbs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static('public'))

//載入Restaurant models
app.get('/', (req, res) => {
  Restaurant.find()
  .lean()
  .then( restaurants => res.render('index', { restaurants }))
  .catch(error => console.error(error))
})

//載入new新增頁面
app.get('/restaurants/new', (req, res) => {
  return res.render('new')
})

//接住new新增頁面的資料，並送進db儲存
app.post('/restaurants', (req, res) => {
  const { name, name_en, category, image, location, phone, google_map, rating, description } = req.body 
  //解構賦值:可以把物件裡的屬性一項項拿出來存成變數
  return Restaurant.create({ name, name_en, category, image, location, phone, google_map, rating, description })     
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//進入detail詳細頁面路由
app.get('/restaurants/:id', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('detail', { restaurant }))
    .catch(error => console.log(error))
})

//進入edit修改資料頁面
app.get('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .lean()
    .then((restaurant) => res.render('edit', { restaurant }))
    .catch(error => console.log(error))
})

//接住edit修改頁面的資料，並送進db儲存
app.post('/restaurants/:id/edit', (req, res) => {
  const id = req.params.id
  const { name, name_en, category, image, location, phone, google_map, rating, description } = req.body
  return Restaurant.findById(id)
    .then(restaurant => { 
      //參考同學寫法
     restaurant.name = name
     restaurant.name_en = name_en
     restaurant.category = category
     restaurant.image = image
     restaurant.location = location
     restaurant.phone = phone
     restaurant.google_map = google_map
     restaurant.rating = rating
     restaurant.description = description
     return restaurant.save()
    })
    .then(()=> res.redirect(`/restaurants/${id}`))
    .catch(error => console.log(error))
})

//刪除資料路由
app.post('/restaurants/:id/delete', (req, res) => {
  const id = req.params.id
  return Restaurant.findById(id)
    .then(restaurant => restaurant.remove())
    .then(() => res.redirect('/'))
    .catch(error => console.log(error))
})

//餐廳搜尋功能
app.get('/search', (req, res) => {
   const keyword = req.query.keyword
    Restaurant.find()
    .lean()
    .then(restaurants => restaurants.filter(restaurant => {
    return restaurant.name.toLowerCase().includes(keyword.toLowerCase())
  }))
  .then(restaurants => res.render('search', { restaurants, keyword }))
    // .then(restaurants => console.log(restaurants))
})

app.listen(3000, () => {
  console.log('App is running on http://localhost:3000')
})