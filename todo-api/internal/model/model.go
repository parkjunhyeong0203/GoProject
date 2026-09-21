package model

import "gorm.io/gorm"

type TodoList struct {
	gorm.Model
	ID          uint   `json:"id" gorm:"not null"`
	Title       string `json:"title" gorm:"not null"`
	Description string `json:"description"`
	Completed   bool   `json:"completed" gorm:"default:false"`
	Priority    string `json:"priority"`
	Category    string `json:"category"`
	DueDate     string `json:"due_date"`
}
