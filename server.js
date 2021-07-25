const express = require('express'); 
const app = express();

var admin = require("firebase-admin");
var serviceAccount = require("./adminsdk.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
var cors = require('cors')
app.use(cors());

//settings
app.set('port', process.env.PORT || 3000);
app.set('json spaces', 2);

//middlewares
app.use(express.json());

//routes
app.use('/api/products', require('./routes/products'));
app.use('/api/requisitions', require('./routes/requisitions'));
app.use('/api/orders', require('./routes/purchaseOrders'));


app.listen(app.get('port'), () => console.log(`Listening on port ${app.get('port')}`));
