import logo from './logo.svg';
import './App.css';


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
      <header className="App-header">
        <input type='text'id='channelname'></input>
        <button onClick={requestSend}>SIema</button>
        <h1>chuj</h1>
      </header>
    </div>
  );

}

export default App;
