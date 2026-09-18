package main

import (
	"todo-api/internal/handler"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	handler.SetupHandlers(r)
	r.Run(":8080")
}
