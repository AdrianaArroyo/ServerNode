const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
//create or use a collection
const productsRef = db.collection('products');


function setHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Allow-Methods, Access-Control-Request-Headers, Access-Control-Allow-Origin");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
}

router.options('/', (req, res) => {
    setHeaders(res);
    resp.statusCode = 200;
    resp.end();
});

router.options('/:id', (req, res) => {
    setHeaders(res);
    res.statusCode = 200;
    res.end()
});

function getRandomCode() {
    let min = Math.ceil(1);
    let max = Math.floor(100);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    productsRef.get().then((snapshot) => {
        let allProducts = [];
        snapshot.forEach(doc => {
            allProducts.push(doc.data());
        });
        res.send(allProducts);

    });
});

router.get('/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    productsRef.doc(req.params.id).get().then((document) => {
        res.send(document.data());
    });
});

router.post('/addSupplie', (req, res) => {
    setHeaders(res);
    const {nombre_producto} = req.body;
    let randomCode = getRandomCode() + getRandomCode();
    const product = {
        "codigo_producto": "pr".split(" ").join("") + randomCode,
        "nombre_producto": nombre_producto,
        "existencia": 0,
        "movimientos": []
    }
    console.log(product);
    productsRef.doc(product.codigo_producto).set(product).then(() => {
        console.log('ok');
        res.send(product);
    });
});

router.put('/updateSupplie/:id', (req, res) => {
    setHeaders(res);
    const {nombre_producto} = req.body;
    productsRef.doc(req.params.id).update({"nombre_producto": nombre_producto}).then((document) => {
      
       res.send(
           {
               "error": false,
               "mensaje": "actualizacion exitosa"
           }
       );
    }).catch(err => {res.send(
        {
            "error": true,
            "mensaje": err.details
        }
    )});

});

router.delete('/delete/:id', (req, res) => {
    productsRef.doc(req.params.id).update({"movimientos": []}).then((document) => {
      
        res.send(
            {
                "error": false,
                "mensaje": "actualizacion exitosa"
            }
        );
     }).catch(err => {res.send(
         {
             "error": true,
             "mensaje": err.details
         }
     )});
});

module.exports = router;