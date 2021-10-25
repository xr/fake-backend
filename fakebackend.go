package main

import (
	"errors"
	"fmt"
	"strconv"
	"time"

	"github.com/aerogo/aero"
)

type Response struct {
	Name       string `json:"name"`
	StatusCode int    `json:"statusCode"`
	Delay      int    `json:"delay"`
}

type FileUploadResponse struct {
	Name       string `json:"name"`
	StatusCode int    `json:"statusCode"`
	Delay      int    `json:"delay"`
	FileSize   int64  `json:"fileSize"`
}

func main() {
	app := aero.New()

	app.Get("/", func(ctx aero.Context) error {
		return ctx.JSON(Response{
			Name:       "Works",
			StatusCode: 200,
			Delay:      0,
		})
	})

	app.Get("/testing/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		statusCode, _ := strconv.Atoi(ctx.Get("statusCode"))

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name:       "Fake Backend Response",
			StatusCode: statusCode,
			Delay:      ms,
		})
	})

	app.Put("/testing/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		statusCode, _ := strconv.Atoi(ctx.Get("statusCode"))

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name:       "Fake Backend Response",
			StatusCode: statusCode,
			Delay:      ms,
		})
	})

	app.Delete("/testing/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		statusCode, _ := strconv.Atoi(ctx.Get("statusCode"))

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name:       "Fake Backend Response",
			StatusCode: statusCode,
			Delay:      ms,
		})
	})

	app.Post("/testing/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		statusCode, _ := strconv.Atoi(ctx.Get("statusCode"))

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name:       "Fake Backend Response",
			StatusCode: statusCode,
			Delay:      ms,
		})
	})

	app.Post("/testing/v1/upload/status/:statusCode/delayed/:ms/size/:expectedContentLength", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		expectedContentLength, _ := strconv.ParseInt(ctx.Get("expectedContentLength"), 10, 64)
		contentLength, _ := strconv.ParseInt(ctx.Request().Header("Content-Length"), 10, 64)
		statusCode, _ := strconv.Atoi(ctx.Get("statusCode"))

		r := ctx.Request().Internal()
		r.ParseMultipartForm(10 << 22)
		file, handler, err := r.FormFile("file")
		if err != nil {
			fmt.Println("Error Retrieving the File")
			fmt.Println(err)
			return ctx.Error(400, err)
		}
		defer file.Close()

		if expectedContentLength != 0 {
			if contentLength != expectedContentLength {
				return ctx.Error(400, errors.New("ContentLength header is not equal to expectedContentLength"))
			}

			if handler.Size > expectedContentLength {
				return ctx.Error(400, errors.New("real file size is bigger than expectedContentLength"))
			}
		}

		if handler.Size == 0 {
			return ctx.Error(400, errors.New("the file is empty"))
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)
		ctx.SetStatus(statusCode)

		return ctx.JSON(FileUploadResponse{
			Name:       handler.Filename,
			StatusCode: statusCode,
			Delay:      ms,
			FileSize:   handler.Size,
		})
	})

	app.Config.Ports.HTTP = 4000

	app.Run()
}
