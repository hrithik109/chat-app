const socket = io()

//elements 

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $message = document.querySelector('#message')

//template
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username , room} = Qs.parse(location.search, {ignoreQueryPrefix : true})

const autoscroll = () => {
    // New message element
    const $newMessage = $message.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $message.offsetHeight

    // Height of messages container
    const containerHeight = $message.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $message.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $message.scrollTop = $message.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render($messageTemplate,{
        //message : message
        username : message.username,
        msg : message.test,
        createdAt :  moment(message.createdAt).format('h:mm a')

    })
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(msg)=>{
    const html = Mustache.render($locationMessageTemplate,{
        username : msg.username, 
        url : msg.url,
        createdAt : moment(msg.createdAt).format('h:mm a')
    }) 
    $message.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
    document.querySelector('#active-member').innerHTML = html
    document.querySelector('#room-header').innerHTML = html
    console.log(html)
})



document.querySelector('#message-form').addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled','disabled')
    //const message = document.querySelector('input').value 
    const message = e.target.elements.msg.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('message delivered')
    })
})

$sendLocationButton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('Geolocation is not support in your browser')
    }
    
    $sendLocationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
        //console.log(position)
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude
        },()=>{
            $sendLocationButton.removeAttribute('disabled')
            console.log('location shared')
        })
    })
})

socket.emit('join', {username,room},(error)=>{
    if(error){
        alert(error)
        location.href = '/'
    }
})







//socket.on('countUpdated',(count)=>{
//    console.log('count has been updated', count)
//})
//
//document.querySelector('#increment').addEventListener('click',()=>{
//    console.log('clicked')
//    socket.emit('increment')
//})