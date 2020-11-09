const express = require('express');
//ayuda en mongo https://www.w3schools.com/nodejs/nodejs_mongodb.asp
//const mongo = require('mongodb'); 
const app = express();
const mongo = require('mongodb').MongoClient
const redis = require("redis");
//const client = redis.createClient(6379,'localhost');
const client = redis.createClient(6379,'35.190.182.75');

//const url = 'mongodb://localhost:27017'
const url = 'mongodb://35.190.182.75:27017'

var infoTodos;
var infoTop3;
var topEdades;
var ultimoRedis;
var ultimoElementoRedis;

client.on('connect', function() {
  console.log('Redis client connected');
  });

function apitop3(){
    mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      const db = client.db('proyecto2')
      const collection = db.collection('personas')
      collection.find().toArray((err, items) => {
        //console.log(items)
      })

      collection.aggregate([
          {
              "$group":{
                  "_id":"$depto",
                  "cantidad_infectados": { "$sum": 1 }
              }
          },
          { "$sort": { "cantidad_infectados": -1 } },
          { "$limit": 3 }
      ]).toArray((err,items)=>{
        infoTop3 = items
        console.log(items)
      })



    })

}
/*
function todosLosDeptos(){
    var deptos;
    mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      const db = client.db('proyecto2')
      const collection = db.collection('personas')
      collection.find().toArray((err, items) => {
        //console.log(items)
      })

      const prueba=collection.aggregate([
          {
              "$group":{
                  "_id":"$depto",
                  "cantidad_infectados": { "$sum": 1 }
              }
          },
          { "$sort": { "cantidad_infectados": -1 } }
      ]).toArray((err,items)=>{
        infoTodos = items;
        console.log("dentro de la funcion flecha");
        console.log(items);
      })

    })
}
*/
setInterval(function(){
    mongo.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }, (err, client) => {
      if (err) {
        console.error(err)
        return
      }
      const db = client.db('proyecto2')
      const collection = db.collection('personas')
      collection.find().toArray((err, items) => {
        //console.log(items)
      })
      collection.aggregate([
        {
            "$group":{
                "_id":"$depto",
                "cantidad_infectados": { "$sum": 1 }
            }
        },
        { "$sort": { "cantidad_infectados": -1 } },
        { "$limit": 3 }
        ]).toArray((err,items)=>{
        infoTop3 = items
        //console.log(items)
        })

      const prueba=collection.aggregate([
          {
              "$group":{
                  "_id":"$depto",
                  "cantidad_infectados": { "$sum": 1 }
              }
          },
          { "$sort": { "cantidad_infectados": -1 } }
        ]).toArray((err,items)=>{
            infoTodos = items;
            //console.log("dentro de la funcion flecha");
            //console.log(items);
        })

      collection.aggregate([
        {
          $bucket:{
            groupBy: "$edad",
            boundaries: [
              0,
              11,21,31,41,51,61,71,81,91,101,111,121
            ],
            default: 131,
            output: {
              
              "cantidad":{
                "$sum": 1
              }
            }
          }
        }
      ]).toArray((err,items)=>{
        topEdades = items;
      })

    })
    client.scard('persona',function(err,res){
      //console.log(res);
      ultimoRedis = res;
    });
    if (typeof ultimoRedis =='undefined'){
      console.log("es indefinido")
    }else{
      client.hvals('persona:'+ultimoRedis.toString(),function(err,res){
        console.log(res);
        ultimoElementoRedis = res;
      })
    }
    /*client.hvals('persona:8',function(err,res){
      console.log(res);
    })*/
    console.log(ultimoRedis)
},4000)

app.get('/ultimo',(req,res)=>{
  res.header("Access-Control-Allow-Origin", "*");
  res.json(ultimoElementoRedis);
})

app.get('/',(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    //res.send("Ya llegue chavos");
    res.json(topEdades)
    //console.log(topEdades)
});

app.get('/deptos',(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.json(infoTodos);
    //res.send("todos los deptos");
})

app.get('/topdeps',(req,res)=>{
    //console.log(infoTop3)
    res.header("Access-Control-Allow-Origin", "*");
    res.json(infoTop3);
    //res.json({'res':'top 3 departamentos'});

});

app.get('/deps_afectados',(req,res)=>{
    res.json({'res':'departamentos afectados'});
});

app.get('/ultimo_caso',(req,res)=>{
    res.json({'res':'Ultimo caso'});
});

app.get('/rango_edad',(req,res)=>{
    res.header("Access-Control-Allow-Origin", "*");
    res.json(topEdades)
    //res.json({'res':'Los que estan valiendo'});
});

app.listen(3001,()=>{
    console.log("Que pedo chavos");
});
