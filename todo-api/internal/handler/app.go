package handler

import "github.com/gin-gonic/gin"

func SetupHandlers(g *gin.Engine) {
	g.GET("/todos", GetTodoHandler)
	g.POST("/todos", PostTodoHandler)
	g.PUT("/todos/:id", PutTodoHandler)
	g.DELETE("/todos/:id", DeleteTodoHandler)
}
func GetTodoHandler(c *gin.Context) {

}
func PostTodoHandler(c *gin.Context) {

}
func PutTodoHandler(c *gin.Context) {

}
func DeleteTodoHandler(c *gin.Context) {

}
