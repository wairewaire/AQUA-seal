FROM golang:1.26-alpine AS build

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /out/aqua-seal-api ./cmd/api

FROM alpine:3.22

RUN adduser -D -H -u 10001 appuser
COPY --from=build /out/aqua-seal-api /aqua-seal-api
USER appuser
EXPOSE 8080
ENTRYPOINT ["/aqua-seal-api"]
