package config

import (
	"log"

	"todo-api/internal/model"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDB() {
	var err error
	// todo.db 파일 생성 및 연결
	DB, err = gorm.Open(sqlite.Open("todo.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("데이터베이스 연결 실패:", err)
	}

	// Struct 정의를 바탕으로 DB 테이블 자동 생성/업데이트
	err = DB.AutoMigrate(&model.TodoList{})
	if err != nil {
		log.Fatal("테이블 마이그레이션 실패:", err)
	}
}
