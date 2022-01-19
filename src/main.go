package main

import (
	"log"
	"net/http"
	"fmt"
	"strings"
	"strconv"
	
	"github.com/gorilla/websocket"
	"github.com/hypebeast/go-osc/osc"
)

var clients = make(map[*websocket.Conn]bool) // connected clients
// or *string
var oscClients = make(map[string]*osc.Client) // connected clients
var broadcast = make(chan Message)           // broadcast channel

// client Singleton
func getClient(name string) *osc.Client  {
	client := oscClients[name]
	if client == nil {
		strs := strings.Split(name,":")
		port, err := strconv.Atoi(strs[1])
		if err != nil {
			fmt.Println("Error Converting port number! %v %v", name, err)
			return nil
		}
		newClient := osc.NewClient(strs[0], port)
		oscClients[name] = newClient
		return getClient(name)
	} else {
		return client
	}
}

// Configure the upgrader
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Define our message object
type Message struct {
	Target  string `json:"target"`
	Path    string `json:"path"`
	Args  []string `json:"args"`
	Params  []string `json:"params"`
}

func main() {

	// Create a simple file server
	fs := http.FileServer(http.Dir("../public"))
	http.Handle("/", fs)

	// Configure websocket route
	http.HandleFunc("/ws", handleConnections)

	// Start listening for incoming chat messages
	go handleMessages()

	// Start the server on localhost port 8000 and log any errors
	log.Println("http server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	// Upgrade initial GET request to a websocket
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal(err)
	}
	// Make sure we close the connection when the function returns
	defer ws.Close()

	// Register our new client
	clients[ws] = true

	for {
		var msg Message
		// Read in a new message as JSON and map it to a Message object
		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("error: %v", err)
			delete(clients, ws)
			break
		}
		// Send the newly received message to the broadcast channel
		broadcast <- msg
	}
}
func sendOSCMessage(msg Message) {
	if len(msg.Args) == len(msg.Params) {
		conn := getClient(msg.Target)
		if conn == nil {
			log.Printf("error: no connection made %v %v", conn, msg)
			return
		}
                log.Printf("msg: %v", msg)
		out := osc.NewMessage(msg.Path)
		for i, arg := range msg.Args {
			param := msg.Params[i]			
			if arg == "i" {
				val, _ := strconv.Atoi(param)
				out.Append(int32(val))
			} else if arg == "f" {
				val, _ := strconv.ParseFloat(param,64)
				out.Append(float32(val))
			} else if arg == "d" {
				val, _ := strconv.ParseFloat(param,64)
				out.Append(float64(val))
			} else if arg == "s" {
                                // log.Printf("String: %v", param)
				out.Append(param)
			} else {
				log.Printf("unsupported type: %v", param)
			}
		}
		log.Printf("Sending %v", out)
		conn.Send(out)
	} else {
		log.Printf("error: args!=params %v", msg)
	}
}

func handleMessages() {
	for {
		// Grab the next message from the broadcast channel
		msg := <-broadcast
		// Send it out to every client that is currently connected
		fmt.Printf("Do something %v\n", msg)
		sendOSCMessage( msg ) 
	}
}
