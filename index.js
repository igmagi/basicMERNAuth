const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const errorHandler = require("./middleware/errorHandler")

const app = express();

require("dotenv").config()

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(()=>{console.log(`Database Successfully Connected.`)})
.catch((er)=> {console.error(er.msg)})


app.use(cors());
app.use(express.json())
app.use("/api/auth", require("./routes/auth"))
app.use("/api/private", require("./routes/private"))
app.use(errorHandler);


const server = app.listen(process.env.PORT, ()=>{
    console.log(`Server running on port ${process.env.PORT}`)
})

// process.on("unhandledRejection"), (err, promise) =>{
//     console.log(`Error: ${err}`);
//     server.close(()=>{process.exit(1)})
// }