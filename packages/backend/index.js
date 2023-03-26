var express = require("express");
var fs = require("fs");
const https = require("https");
var cors = require("cors");
var bodyParser = require("body-parser");
var app = express();

const transactions = {};

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  console.log("/");
  res.status(200).send("hello world");
});

app.get("/:key", function (req, res) {
  let key = req.params.key;
  console.log("/", key);
  console.log("data", transactions[key]);
  res.status(200).send(transactions[key]);
});

app.post("/", function (request, response) {
  console.log("Post", request.body); // your JSON
  const key = request.body.contractAddress + "_" + request.body.chainId;
  console.log("key:", key);
  if (!transactions[key]) {
    transactions[key] = {};
  }
  transactions[key][request.body.hash] = {
    ...request.body,
    signatures: request.body.signatures.sort((a, b) => a.localeCompare(b)),
  };
  console.log("transactions", transactions);
  response.send({ success: true });
});

if (fs.existsSync("server.key") && fs.existsSync("server.cert")) {
  https
    .createServer(
      {
        key: fs.readFileSync("server.key"),
        cert: fs.readFileSync("server.cert"),
      },
      app
    )
    .listen(49832, () => {
      console.log("HTTPS Listening: 49832");
    });
} else {
  var server = app.listen(49832, function () {
    console.log("HTTP Listening on port:", server.address().port);
  });
}
