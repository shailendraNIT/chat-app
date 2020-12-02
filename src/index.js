const path=require('path')
const express = require('express')
const http=require('http')

const Filter=require('bad-words')

const socketio=require('socket.io')
const {generateMessage,generateLocationMessage}=require('./utils/messages.js')
const {addUser,removeUser,getUser,getUsersInRoom}=require('./utils/users')
const { get } = require('https')

const app = express()

const server=http.createServer(app)


const io=socketio(server)
const port=process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection',(socket)=>{
  console.log('Web socket connected ')


  socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username:username,room:room})

    if(error){
      return callback(error)
    }
    socket.join(room)

    socket.emit('message',generateMessage('Admin','Welcome!'))

    socket.broadcast.to(room).emit('message',generateMessage('Admin',`${username} has joined!`))

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    callback()

  })



  socket.on('sendMessage',(message,callback)=>{
    const filter=new Filter()
    if(filter.isProfane(message)){
      return callback('Profanity is not allowed')
    }
    
    const user=getUser(socket.id)

    io.to(user.room).emit('message',generateMessage(user.username,message))
    callback()
  })

  socket.on('disconnect',()=>{
    const user=removeUser(socket.id)
    if(user){
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
    }
    
  })

  

  socket.on('sendLocation',(coords,callback)=>{
    const user=getUser(socket.id)
    io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
    callback()
  })
})

server.listen(port ,()=>{
    console.log(`server is up and running  at port ${port} `)
})