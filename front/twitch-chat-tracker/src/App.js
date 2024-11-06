import logo from './logo.svg';
import './App.css';
import ChatLog from './Chalog';


function App() {
  const response = {}
  let channel_name 
  const requestSend = () => {
    if (document.getElementById('channelname') != null){
    channel_name = document.getElementById('channelname').value
    console.log(channel_name)
  }

  }
  
  return (
    <div className="App">
      <ChatLog></ChatLog>
    </div>
  );

}

export default App;
