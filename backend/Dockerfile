FROM golang:1.21-alpine AS builder

WORKDIR /app

# Use China-accessible Go module proxy to avoid proxy.golang.org timeout
ENV GOPROXY=https://goproxy.cn,https://goproxy.io,direct
ENV GONOSUMCHECK=*
ENV GOFLAGS="-mod=mod"

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o stacklane ./cmd/main.go

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/stacklane .
EXPOSE 8080
CMD ["./stacklane"]
