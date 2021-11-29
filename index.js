const port = process.env.PORT || 3000
const express = require('express')
const app = express()

app.get('/', (req, res) => {
    res.send({headers: req.headers})
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})