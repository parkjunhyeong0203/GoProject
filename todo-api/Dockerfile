# 1. 빌드 스테이지
FROM golang:1.26-alpine AS builder

# SQLite CGO 빌드를 위한 gcc 및 musl-dev 설치
RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# CGO를 활성화하여 빌드
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-w -s" -o main ./cmd/main.go

# 2. 실행 스테이지 (가벼운 Alpine 이미지)
FROM alpine:latest

WORKDIR /app

RUN apk add --no-cache ca-certificates sqlite

# 빌드 결과물 복사
COPY --from=builder /app/main .

# 데이터 저장 디렉토리 생성
RUN mkdir -p /app/data

EXPOSE 8080

CMD ["./main"]