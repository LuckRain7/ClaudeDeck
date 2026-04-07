package main

import (
	"log"
	"net/http"

	"cc-look/backend/internal/api"
)

func main() {
	mux := http.NewServeMux()
	api.Register(mux)
	addr := ":7788"
	log.Printf("cc-look backend listening on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
}
