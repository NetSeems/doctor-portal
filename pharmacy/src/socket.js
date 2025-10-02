// src/socket.js
import { io } from "socket.io-client";

const socket = io("https://apirk.drrkvishwakarma.com"); // replace with your backend URL
// const socket = io("http://localhost:8081"); // replace with your backend URL

export default socket;
