const express = require('express')
const LocalStorage = require('node-localstorage').LocalStorage,localStorage = new LocalStorage('./scratch');
const app = express()
app.use(express.static(__dirname+'/public'));
const fs =require('fs');
const Web3 = require('web3');
var web3 = new Web3('http://localhost:8545')
var abi =
	[
        {
            "inputs": [],
            "name": "retrieve",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "hash1",
                    "type": "string"
                }
            ],
            "name": "store",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        }
    ]
var sendaddr = "0x084ccd122a045fc05f1b0a8ea24af23ed3aac7d0";
var cont_addr = '0x6d3894970e54Ddb08a003748d38df9F5559749AD';
var MyContract = new web3.eth.Contract(abi, cont_addr);
var hash2;
var hash7;
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var ipfsAPI = require('ipfs-api')
var ipfs = ipfsAPI('ipfs.infura.io', '5001', {protocol: 'https'})
 
app.get('/', function (req, res) {
//   res.send('Hello World')
    res.sendFile(__dirname+'/public/index.html');
})

app.post('/valid', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    //console.log('hi');
    //console.log(req.file);
    var data = new Buffer(fs.readFileSync(req.file.path));
    ipfs.add(data, function (err,file){
        if(err){
            console.log(err);
        }
        //console.log(file);
        localStorage.setItem('hash4',file[0].hash);
        hash2=localStorage.getItem('hash4');
        //res.send(hash2);
        console.log('check hash: '+hash2);
        MyContract.methods.retrieve().call({from: sendaddr}, function(error, result){
            localStorage.setItem('hash5',result);
            hash7 = localStorage.getItem('hash5');
            console.log('retrieved hash: '+ hash7);
            if(hash2==hash7){
                console.log('file is not tampered');
                res.send('Hash of original file:'+hash2+'<br/>Hash of current file: '+hash7+ '<br/>Status of file: Not Tampered')
            }
            else{
                console.log('file is tampered');
                res.send('Hash of original file:'+hash2+'<br/>Hash of current file: '+hash7+ '<br/>Status of file: Tampered')
            }
        });
        
        
    })

  })
  app.post('/profile', upload.single('avatar'), function (req, res,next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
    //console.log('hi');
    //console.log(req.file);
    var data = new Buffer(fs.readFileSync(req.file.path));
    ipfs.add(data, function (err,file){
        if(err){
            console.log(err);
        }
        //console.log(file);
        localStorage.setItem('hash3',file[0].hash);
        hash1=localStorage.getItem('hash3');
        res.send('Hash of uploaded file: '+ hash1);
        MyContract.methods.store(hash1).send({from: sendaddr}).then(console.log);
        console.log(hash1);
    })

  })

  app.get('/download/:ID',function(req,res){
      console.log(req.params.ID);
      res.redirect('https://ipfs.io/ipfs/'+req.params.ID);
  })
 
app.listen(3000)