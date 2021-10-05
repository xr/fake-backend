FROM golang:1.14

WORKDIR /go/src

COPY go.mod .
COPY go.sum .
COPY fakebackend.go ./fakebackend.go

RUN go build -a -installsuffix cgo -o fakebackend ./

EXPOSE 4000

CMD ["./fakebackend"]
