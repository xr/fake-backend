package main

import (
	"time"
	"github.com/aerogo/aero"
	"strconv"
)


type Response struct {
	Name string `json:"name"`
	StatusCode int `json:"statusCode"`
	Delay int `json:"delay"`
}

type FileUploadResponse struct {
	Message string `json:"message"`
}

func main() {
	app := aero.New()

	app.Get("/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, delayTimeError := strconv.Atoi(ctx.Get("ms"))
		statusCode, statusCodeErr := strconv.Atoi(ctx.Get("statusCode"))

		if delayTimeError != nil {
			return ctx.Error(400)
		}

		if statusCodeErr != nil {
			return ctx.Error(400)
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name: "Fake Backend Response",
			StatusCode: statusCode,
			Delay: ms,
		})
	})

	app.Put("/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, delayTimeError := strconv.Atoi(ctx.Get("ms"))
		statusCode, statusCodeErr := strconv.Atoi(ctx.Get("statusCode"))

		if delayTimeError != nil {
			return ctx.Error(400)
		}

		if statusCodeErr != nil {
			return ctx.Error(400)
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name: "Fake Backend Response",
			StatusCode: statusCode,
			Delay: ms,
		})
	})

	app.Delete("/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, delayTimeError := strconv.Atoi(ctx.Get("ms"))
		statusCode, statusCodeErr := strconv.Atoi(ctx.Get("statusCode"))

		if delayTimeError != nil {
			return ctx.Error(400)
		}

		if statusCodeErr != nil {
			return ctx.Error(400)
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name: "Fake Backend Response",
			StatusCode: statusCode,
			Delay: ms,
		})
	})

	app.Post("/status/:statusCode/delayed/:ms", func(ctx aero.Context) error {
		ms, delayTimeError := strconv.Atoi(ctx.Get("ms"))
		statusCode, statusCodeErr := strconv.Atoi(ctx.Get("statusCode"))

		if delayTimeError != nil {
			return ctx.Error(400)
		}

		if statusCodeErr != nil {
			return ctx.Error(400)
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)

		ctx.SetStatus(statusCode)

		return ctx.JSON(Response{
			Name: "Fake Backend Response",
			StatusCode: statusCode,
			Delay: ms,
		})
	})

	// put expectedSizeKb less than the actual content length
	app.Post("/upload/delayed/:ms/size/:expectedSizeKb", func(ctx aero.Context) error {
		ms, delayTimeError := strconv.Atoi(ctx.Get("ms"))
		expectedSize, expectedSizeError := strconv.Atoi(ctx.Get("expectedSizeKb"))
		contentLength, contentLengthError := strconv.Atoi(ctx.Request().Header("Content-Length"))

		if expectedSizeError != nil {
			return ctx.Error(400)
		}

		if delayTimeError != nil {
			return ctx.Error(400)
		}


		if contentLengthError != nil {
			return ctx.Error(400)
		}

		time.Sleep(time.Duration(ms) * time.Millisecond)

		if contentLength >  (expectedSize * 1024) {
			return ctx.Error(400)
		}

		return ctx.JSON(FileUploadResponse{
			Message: "File Uploaded",
		})
	})

	app.Run()
}
