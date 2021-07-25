const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const f = new Date();
const db = admin.firestore();
//create or use a collection
const ordersRef = db.collection('orders');
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
    let max = Math.floor(50);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get('/', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    ordersRef.get().then((snapshot) => {
        let allOrders = [];
        snapshot.forEach(doc => {
            allOrders.push(doc.data());
        });
        res.send(allOrders);

    });
});

router.get('/:id', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    ordersRef.doc(req.params.id).get().then((document) => {
        res.send(document.data());
    });
});

router.post('/addOrders', (req, res) => {
    setHeaders(res);
    const date = f.getDate() + "/" + (f.getMonth() + 1) + "/" + f.getFullYear();
    let randomCode = getRandomCode() + getRandomCode();
    let order = {
        "numero_orden": "or".split(" ").join("") + randomCode,
        "fecha": date,
        "productos": req.body
    }

    validateExistProducts(order.productos, res, order);

    ordersRef.doc(order.numero_orden).set(order).then(() => {
        res.send(order);
    }).catch(err => {
        res.send(
            {
                "error": true,
                "mensaje": err.details
            }
        )
    });
});

async function validateExistProducts(productsList, res, order) {

    productsList.forEach(async element => {
        let product = await productsRef.doc(element.codigo_comprar).get();
        if (!product.exists) {
            return (
                {
                    "error": true,
                    "mensaje": "el producto" + element.codigo_comprar + " no existe"
                }
            )
        } else {
            let productBase = product.data();
            //modificar la cantidad de existencias en el producto del firebase
            let stockUpdate = productBase.existencia + element.cantidad_comprar;
            await productsRef.doc(productBase.codigo_producto).update({ "existencia": stockUpdate });

            //insertar movimientos
            const movement = {
                tipo: 1,
                codigo_movimiento: order.numero_orden,
                cantidad_movimiento: element.cantidad_comprar
            };
            let listMovements = [...productBase.movimientos];
            listMovements.push(movement);


            await productsRef.doc(productBase.codigo_producto).update({ "movimientos": listMovements });

        }

    })

}


module.exports = router;