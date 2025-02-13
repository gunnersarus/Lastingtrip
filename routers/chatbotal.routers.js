const express = require("express");
const chatbotAl = express.Router();
const { uploadImage } = require("../middlewares/upload/upload-image");
const TeachableMachine = require("@sashido/teachablemachine-node");
const { authenticateToken } = require("../middlewares/authen/auth.middleware");
const model = new TeachableMachine({
  modelUrl: "https://teachablemachine.withgoogle.com/models/v6LbHtKtR/",
});
var { csrfProtection, parseForm } = require("../middlewares/authen/csrfProtection"); 
// Sử dụng Express static middleware để phục vụ tệp tĩnh từ thư mục "public"
chatbotAl.use(express.static("public"));

chatbotAl.post(


  "/findlocation",parseForm, csrfProtection,
  authenticateToken,

  uploadImage("ModelAlImage"),
  async (req, res) => {
    try {
      // Lấy đường dẫn tuyệt đối của ảnh vừa upload từ req.file.filename
      const imageUrl = `http://${req.get("host")}/image/ModelAlImage/${
        req.file.filename
      }`;

      // Gửi đường dẫn của ảnh đến model để phân loại
      const predictions = await model.classify({ imageUrl });
      console.log(predictions);
      // Trả về kết quả dự đoán của model
      res.json(predictions);
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).send("Something went wrong!");
    }
  }
);

module.exports = {
  chatbotAl,
};
