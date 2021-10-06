package main

import (
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
	Message string `json:"message"`
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

	app.Get("/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
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

	app.Put("/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
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

	app.Delete("/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
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

	app.Post("/v1/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
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

	// minimumSizeKb should be less than the actual content length
	app.Post("/upload/delayed/:ms/size/:minimumSizeBytes", func(ctx aero.Context) error {
		ms, _ := strconv.Atoi(ctx.Get("ms"))
		minimumSizeBytes, _ := strconv.Atoi(ctx.Get("minimumSizeBytes"))
		contentLength, _ := strconv.Atoi(ctx.Request().Header("Content-Length"))

		time.Sleep(time.Duration(ms) * time.Millisecond)

		if contentLength < minimumSizeBytes {
			return ctx.Error(400)
		}

		return ctx.JSON(FileUploadResponse{
			Message: "File Uploaded",
		})
	})

	app.Run()
}
