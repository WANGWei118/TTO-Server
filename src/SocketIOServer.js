/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

import http from 'http'
import express from 'express'
import sio from 'socket.io'
const database = require('./database/database')

/**
 * Main class to manage SocketIOServer.
 *
 * @class SocketIOServer
 */
class SocketIOServer {
  /**
   * SocketIOServer constructor.
   *
   * @constructor
   */
  constructor() {
    this._socketIOClients = {}
    this._onNewClientCallback = null
    this._onClientDisconnectionCallback = null
    database.init()
  }

  /**
   * Init and start SocketIOServer.
   *
   * @method start
   * @param {number} socketIOPort - Socket IO Server's port. Default : 10000
   */
  start(socketIOPort = 10000) {
    this._app = express()
    this._httpServer = http.createServer(this._app)
    this._ioServer = sio(this._httpServer)
    this.handleSocketIOClient()

    this._httpServer.listen(socketIOPort, () => {
      console.info('SocketIOServer is ready.')
      console.info('Socket.IO\'s port is ', socketIOPort)
    })
  }

  /**
   * Set the new client callback.
   *
   * @method onNewClient
   * @param {Function} newClientCallback - new client callback function.
   */
  onNewClient(newClientCallback) {
    this._onNewClientCallback = newClientCallback
  }

  /**
   * Set the client disconnection callback.
   *
   * @method onClientDisconnection
   * @param {Function} clientDisconnectionCallback - client disconnection callback function.
   */
  onClientDisconnection(clientDisconnectionCallback) {
    this._onClientDisconnectionCallback = clientDisconnectionCallback
  }

  onClientMessage(clientMessageCallBack) {
    this._onClientMessageCallback = clientMessageCallBack
  }

  /**
   * New client.
   *
   * @method newClient
   * @param {Object} socket - client socket.
   */
  newClient(socket) {
    this._socketIOClients[socket.id] = true
    if (this._onNewClientCallback !== null) {
      this._onNewClientCallback(socket)
    }
  }

  /**
   * Disconnect client.
   *
   * @method disconnectClient
   * @param {Object} socket - client socket.
   */
  disconnectClient(socket) {
    if (this._onClientDisconnectionCallback !== null) {
      this._onClientDisconnectionCallback(socket)
    }
    delete this._socketIOClients[socket.id]
  }

  /**
   * Handle new Socket.IO 's client connection.
   *
   * @method handleSocketIOClient
   */
  handleSocketIOClient() {
    this._ioServer.on('connection', (socket) => {
      console.info('New Socket.IO Client Connection : ', socket.id)
      this.newClient(socket)

      socket.on('MESSAGE', () => {
        console.log('hello')
        socket.emit('test', 'hellollllll')
      })

      socket.on('get quizz', () => {
        console.log('Client wants quizz')
        database.sendAllQuizz(socket)
      })

      socket.on('disconnect', () => {
        console.info('Socket.IO Client disconnected : ', socket.id)
        this.disconnectClient(socket)
      })

      socket.on('error', (errorData) => {
        console.info('An error occurred during Socket.IO Client connection : ', socket.id)
        console.debug(errorData)
        this.disconnectClient(socket)
      })

      socket.on('reconnect', (attemptNumber) => {
        console.info('Socket.io Client Connection : ', socket.id, ' after ', attemptNumber, ' attempts.')
        this.newClient(socket)
      })

      socket.on('reconnect_attempt', () => {
        console.info('Socket.io Client reconnect attempt : ', socket.id)
      })

      socket.on('reconnecting', (attemptNumber) => {
        console.info('Socket.io Client Reconnection : ', socket.id, ' - Attempt number ', attemptNumber)
        this.disconnectClient(socket)
      })

      socket.on('reconnect_error', (errorData) => {
        console.info('An error occurred during Socket.io Client reconnection for Root namespace : ', socket.id)
        console.debug(errorData)
        this.disconnectClient(socket)
      })

      socket.on('reconnect_failed', () => {
        console.info('Failed to reconnect Socket.io Client for Root namespace : ', socket.id, '. No new attempt will be done.')
        this.disconnectClient(socket)
      })
    })
  }
}

export default SocketIOServer
