import React, { useState, useEffect,useRef } from 'react';
import {users} from './Constant/index'
import io from 'socket.io-client';
import axios from 'axios';
const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: "Bearer your_secret_token"
  }
});

function Chat() {
  const [userName,setUserName]=useState("")
  const [userList,setUserList]=useState([])
  const [moduleName,setmoduleName]=useState("chat")
  const [roomId,setroomId]=useState("")
  const [userId, setUserId] = useState(''); // Default or empty string if you prefer
  const [senderId, setsenderId] = useState(''); // Default or empty string if you prefer
  const [reciverId, setReciverId] = useState(''); // Default or empty string if you prefer
  const [adminId, setAdminId] = useState('5'); // Default or empty string if you prefer
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    if (userId && reciverId) {
    GetMessageChat(userId,reciverId)
    socket.emit('join_room', { userId, reciverId,moduleName });
    
    }
    
  
    const usersListing=users.filter((v)=>v.name !==userName)
    const userIdFind=users.find((v)=>v.name ==userName)?.id
    setUserList(usersListing)
    setUserId(userIdFind)
    const handleUserVerify=(isValid)=>{
if(isValid)
{
  console.log("verify user ")
}
else{
  alert("unauth user")
}
  
    }
    socket.on('tokenVerification', handleUserVerify);
    // Re-join the room on userId or adminId change
  
    //  const roomId= `chat_${reciverId}_${userId}`


    // Setup listener for incoming messages
    const handleReceiveMessage = (data) => {
      console.log(data,"socke=======",roomId, "==" ,data.roomId)
      if(roomId == data.roomId)
   {
   
        setMessages((msgs) => [...msgs, data]);
      }
    };

    socket.on('receive_message', handleReceiveMessage);
   

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, [userId, adminId,userName,reciverId,roomId]);


  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sendMessage = () => {
    // const roomId = `chat_${userId}_${reciverId}`;
    console.log(roomId)
    if (message !== '') {
      socket.emit('send_message', { roomId, message, senderId: userId,moduleName,userId, reciverId });
      setMessage(''); 
    }
  };

  const GetMessageChat = async (userId, reciverId) => {
    try {
      const response = await axios.get('http://localhost:3000/chat', {
        params: {
          userId: userId,
          reciverId: reciverId,
          moduleName: moduleName
        }
      });
      console.log()
      setroomId(response?.data[0]?.RoomId)
      setMessages(response?.data);
      console.log(response?.data[0]?.RoomId,"response.data")
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      return null;
    }
  };
  return (
    <>
    <h4 className='flex justify-center mt-10 text-green-600'>Chat app demo</h4>
 <div className='pl-16'>
    <p>Enter userName</p>
    <input
        type="text"
        placeholder="Enter userName"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      </div>
    <div className='h-[400px] mx-32 mt-10 border flex justify-center  '>
   
<div className=' w-1/3 border '>
 <p className='flex items-center text-green-600 justify-center py-3'>User Chat : {userName}</p>
 {userList?.map((v)=> <div onClick={()=>setReciverId(v.id)} className={`flex hover:bg-blue-500  cursor-pointer space-x-2 py-2 pl-4 items-center ${v.id==reciverId?"bg-blue-500":""}`}>
  <div className='w-8 h-8 bg-[#f7f7f7]  text-center rounded-full flex justify-center'>
  {v.name.charAt(0)}
  </div>
  <p>
    {v.name}
  </p>
 </div>)}

</div>
<div className=' w-full border '>
  <div className='flex flex-col h-full justify-between'>
  <div className='h-[400px] overflow-y-auto'>
        {messages.map((msg, index) => (
          <div className={`${userId == msg.userId? "justify-start":"justify-end "} flex   m-4  `}>
          <p key={index} className={` ${userId == msg.userId? "bg-blue-500":"bg-[#f7f7f7] "} rounded p-3`}>
            
            {msg.message}
          </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
  <div className='w-full flex '>
  <input
        type="text"
        placeholder="Type a message..."
        value={message}
        className='w-full '
        onChange={(e) => setMessage(e.target.value)}
      />
      <button onClick={sendMessage} className='bg-blue-500 text-white'>Send </button>
  </div>
  </div>
</div>
    </div>
   
    </>
  );
}

export default Chat;
