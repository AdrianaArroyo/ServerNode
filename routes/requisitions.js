const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const f = new Date();
const db = admin.firestore();
//create or use a collection
const requisitionsRef = db.collection('requisitions');
const productsRef = db.collection('products');


function setHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Allow-Methods, Access-Control-Request-Headers, Access-Control-Allow-Origin");
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
}

router.options('/', (req, res) => {
    setHeaders(res);
    res.statusCode = 200;
    res.end();
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
    requisitionsRef.get().then((snapshot) => {
        let allRequisitions = [];
        snapshot.forEach(doc => {
            allRequisitions.push(doc.data());
        });
        res.send(allRequisitions);

    });
});

router.get('/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    requisitionsRef.doc(req.params.id).get().then((document) => {
        res.send(document.data());
    });
});

router.post('/addRequisitions', (req, res) => {
    setHeaders(res);
    const date = f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear();
    let randomCode = getRandomCode() + getRandomCode();
    const requisition = {
        "numero_requisicion": "req".split(" ").join("") + randomCode,
        "fecha": date,
        "productos": req.body
    }

    validateExistProducts(requisition.productos, res, requisition);
    requisitionsRef.doc(requisition.numero_requisicion).set(requisition).then(() => {
        res.send(requisition);
    }).catch(err => {
        res.send(
            {
                "error": true,
                "mensaje": err.details
            }
        )
    });
});

async function validateExistProducts(productsList, res, requisition) {

    productsList.forEach(async element => {
        let product = await productsRef.doc(element.codigo).get();
        if (!product) {
            return (
                {
                    "error": true,
                    "mensaje": "el producto" + element.codigo + " no existe"
                }
            )
        } else {
            try {
            let productBase = product.data();
                //modificar la cantidad de existencias en el producto del firebase
                let stockUpdate = productBase.existencia - element.cantidad;
                await productsRef.doc(productBase.codigo_producto).update({ "existencia": stockUpdate });

                //insertar movimientos
                const movement = {
                    tipo: 2,
                    codigo_movimiento: requisition.numero_requisicion,
                    cantidad_movimiento: element.cantidad
                };

                let  listMovements = [...productBase.movimientos];
                listMovements.push(movement);
                await productsRef.doc(productBase.codigo_producto).update({ "movimientos": listMovements });
            }catch(error) {
                console.log(error);
            }
                    
        }
    })
}

module.exports = router;