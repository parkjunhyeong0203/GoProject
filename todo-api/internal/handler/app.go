package handler

import (
	"errors"
	"net/http"
	"todo-api/config"
	"todo-api/internal/middleware"
	"todo-api/internal/model"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type UserInfo struct {
	UserName string `json:"user_name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}
type TodoInfo struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Priority    string `json:"priority"`
	Completed   *bool  `json:"completed"`
	Category    string `json:"category"`
	DueDate     string `json:"due_date"`
}

func SetupHandlers(g *gin.Engine) {
	// 인증이 필요 없는 공개 라우트
	auth := g.Group("/auth")
	{
		auth.POST("/register", GenerateUser)
		auth.POST("/login", LoginUser)
	}

	// JWT 미들웨어 적용 라우트 그룹
	api := g.Group("/todos")
	api.Use(middleware.AuthMiddleware()) // 미들웨어 적용
	{
		api.GET("", GetTodoHandler)
		api.POST("", PostTodoHandler)
		api.PUT("/:id", PutTodoHandler)
		api.DELETE("/:id", DeleteTodoHandler)
	}
}
func GenerateUser(c *gin.Context) {

}
func LoginUser(c *gin.Context) {

}
func GetTodoHandler(c *gin.Context) {
	userIDVal, exist := c.Get("userID")
	if !exist {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "There is no infomation"})
		return
	}
	userID := uint(userIDVal.(float64)) //DB에서 해당 유저 Todo 조회

	var todos []model.TodoList
	result := config.DB.Where("id = ?", userID).Find(&todos)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Todo access fail"})
	}
	c.JSON(http.StatusOK, gin.H{"count": len(todos), "data": todos})

}
func PostTodoHandler(c *gin.Context) {
	userIDVal, exists := c.Get("userID")
	req := &TodoInfo{}
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "There is no infomaiton"})
		return
	}
	userID := uint(userIDVal.(float64))
	if err := c.ShouldBindJSON(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "It is not correct"})
	}
	todo := model.TodoList{
		ID:          userID,
		Title:       req.Title,
		Description: req.Description,
		Priority:    req.Priority,
		Category:    req.Category,
		DueDate:     req.DueDate,
		Completed:   false,
	}
	result := config.DB.Create(&todo)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "save fail"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Todo save success", "data": todo})
}
func PutTodoHandler(c *gin.Context) {
	todoID := c.Param("id")

	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "There is no infomation"})
		return
	}
	userID := uint(userIDVal.(float64))
	req := &TodoInfo{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "not correct value"})
		return
	}
	var todo model.TodoList
	err := config.DB.Where("id= ? AND user_id = ?", todoID, userID).First(&todo).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "There is no Todo"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB Query fail"})
		return
	}
	updateFields := make(map[string]interface{})
	if req.Title != "" {
		updateFields["title"] = req.Title
	}
	if req.Description != "" {
		updateFields["description"] = req.Description
	}
	if req.Completed != nil {
		updateFields["completed"] = *req.Completed
	}
	if req.Priority != "" {
		updateFields["priority"] = req.Priority
	}
	if req.Category != "" {
		updateFields["category"] = req.Category
	}
	if req.DueDate != "" {
		updateFields["due_date"] = req.DueDate
	}

	if err := config.DB.Model(&todo).Updates(updateFields).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Todo update fail"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todo update success", "data": todo})

}
func DeleteTodoHandler(c *gin.Context) {
	todoID := c.Param("id")

	userIDVal, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "There is no infomation"})
		return
	}
	userID := uint(userIDVal.(float64))

	result := config.DB.Where("id = ? AND user_id = ?", todoID, userID).Delete(&model.TodoList{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Todo delete fail"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Todo delete fail"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Todo delete success", "id": todoID})
}
