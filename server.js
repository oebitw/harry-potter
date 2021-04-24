'use strict';

//////////////////////
//// DEPENDENCIES ///
////////////////////

// DOTENV
require('dotenv').config();

//EXPRESS
const express= require('express');

// CORS
const cors= require('cors');

//superagent
const superagent=require('superagent');

//PG
const pg= require('pg');

//method-override
const methodOverride=require('method-override');


//////////////////////
//// APP SETUP    ///
////////////////////

//PORT
const PORT= process.env.PORT || 3000;

//run express
const app=express();

//use cors
app.use(cors());

//middleware
app.use(express.urlencoded({extended:true}));

////PG
//1
// const client= new pg.Client({connectionString: process.env.DATABASE_URL, ssl:{ rejectUnauthorized:false} });
//2
const client =new pg.Client(process.env.DATABASE_URL);

//methodOverride
app.use(methodOverride('_method'));


//////////////////////
//// Templating   ///
////////////////////

//public
app.use(express.static('./public'));

//EJS
app.set('view engine', 'ejs');

//////////////////////
//// Routes       ///
////////////////////

app.get('/', homeHandler);
app.post('/fav-char', addHandler);
app.get('/fav-char', renderFavHandler);
app.get('/detail/:id', renderDetail);
app.put('/detail/:id', editHandler);
app.delete('/detail/:id', deleteHandler);
app.get('/create', renderCreate);
app.post('/created-char', addCreatedHandler);
app.get('/created-char', renderCreatedHandler);
app.get('/alreadyAdded', alreadyAddedHandler)







///////////////////
//// HANDLERS ////
/////////////////

function homeHandler(req,res){
    let url = 'http://hp-api.herokuapp.com/api/characters';
    superagent.get(url).then(data=>{

        let dataBody= data.body;

        let correctData= dataBody.map(e=>{
            return new Char(e);
        });

        res.render('pages/index', {data:correctData});


    })
}

function addHandler(req,res){
    const {name, house,patronus, image,alive }= req.body;
    const safeValues=[name, house, patronus, image, alive, 'api'];
    const SQL= `INSERT INTO table1 (name, house,patronus, image,alive, created_by) VALUES($1,$2,$3,$4,$5,$6);`;

    const searchSql=`SELECT * FROM table1 WHERE name = '${name}';`

    client.query(searchSql).then(searchedData=>{
        if(searchedData.rows.length===0){
            client.query(SQL,safeValues).then(()=>{
                res.redirect('/fav-char')
            });
        } else if(searchedData.rows[0].name===name){
            res.redirect('/alreadyAdded');
        }
    })
}
// let SQL = `SELECT * FROM locations WHERE search_query = '${cityName}';`;

function alreadyAddedHandler(req,res){
    res.render('pages/alreadyAdded')
}


function renderFavHandler(req,res){
    const SQL= 'SELECT * FROM table1 WHERE created_by=$1;';
    const safeValues=['api'];

    client.query(SQL,safeValues).then(data=>{
        res.render('pages/fav', {data:data.rows});
    });
}

function renderCreatedHandler(req,res){
    const SQL= 'SELECT * FROM table1 WHERE created_by=$1;';
    const safeValues=['user'];

    client.query(SQL,safeValues).then(data=>{
        res.render('pages/createdlist', {data:data.rows});
    });
}

function renderDetail(req,res){
    let id= req.params.id;
    let SQL= `SELECT * FROM table1 WHERE id=$1;`;
    let safeValues=[id];
    client.query(SQL,safeValues).then(data=>{
        res.render('pages/details', {data:data.rows[0]});
    })
}

function editHandler (req,res){
    const id= req.params.id;
    const {name, house,patronus, image,alive }= req.body;
    const SQL= 'UPDATE table1 SET name=$1, house=$2 ,patronus=$3, image=$4,alive=$5 WHERE id=$6;';
    const safeValues=[name, house,patronus, image,alive,id ];

    client.query(SQL,safeValues).then(()=>{
        res.redirect(`/detail/${id}`);
    });
}

function deleteHandler(req,res){
    const id = req.params.id;
    const SQL=`DELETE FROM table1 WHERE id=$1;`;
    const safeValues=[id];
    client.query(SQL,safeValues).then(()=>{
        res.redirect('/fav-char');
    })
}

function renderCreate(req,res){
    res.render('pages/create')
}


function addCreatedHandler(req,res){

    const {name, house,patronus, image,alive }= req.body;
    const safeValues=[name, house, patronus, image, alive, 'user'];
    const SQL= `INSERT INTO table1 (name, house,patronus, image,alive, created_by) VALUES($1,$2,$3,$4,$5,$6);`;
    client.query(SQL,safeValues).then(()=>{
        res.redirect('/created-char')
    })

}
//////////////////////
//// Constructor  ///
////////////////////

function Char(data){
    this.name=data.name;
    this.house=data.house ? data.house: 'unknown House' ;
    this.patronus=data.patronus ? data.patronus: 'unknown patronus';
    this.image=data.image;
    this.alive=data.alive ? data.alive:'unknown life status';
}



//////////////////////
//// Listening    ///
////////////////////

client.connect().then(()=>{
    app.listen(PORT, ()=>{
        console.log(`listening on: ${PORT}`)
    });
});
