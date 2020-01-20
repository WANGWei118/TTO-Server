/**
 * @author Christian Brel <ch.brel@gmail.com>
 */

import SocketIOServer from './SocketIOServer'
import ClientManager from './ClientManager'

const clientManager = new ClientManager()

const onNewClient = (socket) => {
  clientManager.addClient(socket)
}

const onClientDisconnection = (socket) => {
  clientManager.deleteClient(socket)
}

const socketIOServer = new SocketIOServer()
socketIOServer.onNewClient(onNewClient)
socketIOServer.onClientDisconnection(onClientDisconnection)
socketIOServer.start()
