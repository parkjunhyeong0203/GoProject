package main

import (
	"todo-api/internal/handler"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(cors.Default())
	handler.SetupHandlers(r)
	r.Run(":8080")
}
