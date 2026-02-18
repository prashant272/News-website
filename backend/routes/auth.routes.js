const express = require('express')
const { UserSignUp, UserSignIn, GetAllUsers, CreateUserByAdmin, UpdateUser, DeleteUser } = require('../Controllers/auth.controller')

const AuthRouter = express.Router()

AuthRouter.post("/signup", UserSignUp)
AuthRouter.post("/signin", UserSignIn)
AuthRouter.get("/all", GetAllUsers)
AuthRouter.post("/create", CreateUserByAdmin)
AuthRouter.put("/update/:id", UpdateUser)
AuthRouter.delete("/:id", DeleteUser)

module.exports = AuthRouter