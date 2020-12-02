
const socket=io()

const $messageForm=document.querySelector('#message-form')
const $messageInput=$messageForm.querySelector('input')
const $messageButton=$messageForm.querySelector('button')

const $locationButton=document.querySelector('#location-button')

const $messages= document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate=document.querySelector('#locationMessage-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML

const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix: true })



const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild
    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    // Visible height
    const visibleHeight = $messages.offsetHeight
    // Height of messages container
    const containerHeight = $messages.scrollHeight
    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
    }
   }

socket.emit('join',({username,room}),(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.on('message',(message)=>{
    const html=Mustache.render(messageTemplate,
        {
            username:message.username,
            message : message.text,
            createdAt: moment(message.createdAt).format('h:mm a')
        })

    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(locationMessage)=>{
    const html=Mustache.render(locationMessageTemplate,{
        username:message.username,
        url:locationMessage.url,
        createdAt:moment(locationMessage.createdAt).format('h:mm a')
    })
    
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disabling send button
    $messageButton.setAttribute('disabled','disabled')

    const message=document.querySelector('input').value

    socket.emit('sendMessage',message,(error)=>{
        //enabling send button
        $messageButton.removeAttribute('disabled')
        $messageInput.value=''
        $messageInput.focus()



        if(error){
            return console.log(error)
        }
        console.log('message delivered!')
    })
})

$locationButton.addEventListener('click',()=>{

    //disabling 
    $locationButton.setAttribute('disabled','disabled')

    if(!navigator.geolocation){
        return alert(`Browser doesn't support geolocation`)
    }


    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position.coords)

        socket.emit('sendLocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            //enabling button 

            $locationButton.removeAttribute('disabled')
            
            console.log('Location shared')

        })

    })
})