const express = require('express')
const app = express()
const path = require('path')
const fs = require('fs')
const rimraf = require('rimraf')

// Monitor Script to delete file after 24 hours
var uploadDir = __dirname + "/public/uploads"

setInterval(()=>{
    fs.readdir(uploadDir, (err, files)=>{
        files.forEach((file,index)=>{
            fs.stat(path.join(uploadDir, file), (err, stat)=>{
                var endTime, now;
                if(err){
                    return console.error(err);
                }
                now = new Date().getTime();
                endTime = new Date(stat.ctime).getTime() + 20000;
                if(now > endTime){
                    return rimraf.rimraf(path.join(uploadDir, file));
                }
            });
        });
    });
}, 2000);

// Multer Library

const multer = require('multer');

// Making Uploads Directory in Public as Static Directory

app.use(express.static(path.join(__dirname + "public/uploads")))

// Body parser for Forms

const bodyparser = require('body-parser')

app.use(bodyparser.urlencoded({extended: false}));
app.use(bodyparser.json());

// Multer Storage

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
        cb(
            null,
            file.fieldname + "-" + Date.now() + path.extname(file.originalname)
        );
    },
  });
  
  const upload = multer({ storage: storage }).single('file')

// Define view Engine

app.set('view engine', 'ejs')

// Home route

app.get('/', (req, res)=>{
    res.render('index')
});

app.post('/uploadfile', (req, res)=>{
    upload(req, res, (err)=>{
        if(err){
            console.log(err);
        }
        else{
            // console.log(req.file.path);
            res.json({path:req.file.filename});
        }
    })
});

// Make GET Request for download file

app.get('/files/:id', (req,res)=>{
    console.log(req.params.id)

    res.render('displayfile', {path:req.params.id})
})

// Make Download GET Request
app.get('/download', (req,res)=>{
    var pathoutput = req.query.path;
    console.log(pathoutput)
    var fullpath = path.join(__dirname, pathoutput)
    res.download(fullpath, (err)=>{
        if(err){
            res.send(err);
        }
    });
});

// Define Ports

const PORT = process.env.PORT || 5000
app.listen(PORT, ()=>{
    console.log(`App is listening on port ${PORT}`)
})