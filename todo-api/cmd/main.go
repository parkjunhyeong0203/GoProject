package main

import (
	"todo-api/config"
	"todo-api/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	c := cors.DefaultConfig()
	c.AllowOrigins = []string{"http://localhost:3000"}
	c.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	c.AllowCredentials = true

	r.Use(cors.New(c))
	config.InitDB()
	handler.SetupHandlers(r)
	r.Run(":8080")
}
