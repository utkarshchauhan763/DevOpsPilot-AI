const express = require("express");
const { registerUser,loginUser,getCurrentUser } = require("../controllers/auth.controller");
const {protect,authorize} = require("../middleware/auth.middleware");
const sendResponse = require("../utils/response");
const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/me",protect,getCurrentUser);
router.get("/admin",protect,authorize("admin"),(req,res)=>{
    return sendResponse(
        res,
        200,
        "Admin access granted",
        {
            userId: req.user.userId,
            role: req.user.role
        }
    );
});
module.exports = router;