package main

import "github.com/hypebeast/go-osc/osc"
import "fmt"

func main() {
	addr := "127.0.0.1:8765"
	server := &osc.Server{Addr: addr}

	server.Handle("/message/address", func(msg *osc.Message) {
		fmt.Println("/message/address")
		osc.PrintMessage(msg)
	})
	server.Handle("*", func(msg *osc.Message) {
		fmt.Println("Default Handler")
		osc.PrintMessage(msg)
	})

	server.ListenAndServe()
}
