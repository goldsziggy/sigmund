"use strict";

var _express = _interopRequireDefault(require("express"));
var _getChat = _interopRequireDefault(require("./routes/get-chat"));
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }
//sample express app

var app = (0, _express["default"])();
var PORT = 8080;
app.use(_express["default"]["static"](__dirname + "/public"));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded({
  extended: false
}));
var api = _express["default"].Router();
api.get("/chat", _getChat["default"]);
app.listen(PORT, function () {
  console.log("Sigmund app listening on port ".concat(PORT));
});