import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";
import './App.css'

const wss = new W3CWebSocket('ws://127.0.0.1:8000');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {value: '', slave: 0, server: 0, logs: []};
    this.search = this.search.bind(this);
    this.stop = this.stop.bind(this);
    this.exit = this.exit.bind(this);
    this.addSlave = this.addSlave.bind(this);
    this.removeSlave = this.removeSlave.bind(this);

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  hashChange(event) {
    console.log(event)
    this.setState({value: event.target.hash});
  }

  componentWillMount() {
    let save;
    wss.onopen = () => {
      wss.send('server')
    };

    wss.onmessage = (event) => {
      console.log('get : ' + event.data)
      let parts = event.data.split(' ');

      switch (parts[0]) {
        case 'nbSlave':
          this.setState({slave: parts[1]});
          break;
        case 'nbServer':
          this.setState({server: parts[1]});
          break
        case 'search':
          save = this.state.logs;
          save.push('A la recherche du hash : ' + parts[1])
          this.setState({logs: save});
          break;
        case 'stop':
          save = this.state.logs;
          save.push('Tout les slave ont arrété de chercher')
          this.setState({logs: save});
          break;
        case 'exit':
          save = this.state.logs;
          save.push('Tout les slave ont été arrété')
          this.setState({logs: save});
          break;
        case 'found':
          save = this.state.logs;
          save.push('md5 trouvé : ' + parts[1] + ' -> ' + parts[2])
          this.setState({logs: save});
          break;
        case 'db':
          save = this.state.logs;
          save.push('base de données : ' + parts[1] + ' -> ' + parts[2])
          this.setState({logs: save});
          break;
        default:
          break
      }
    }
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    this.search(this.state.value);
    event.preventDefault();
  }


  search(hash) {
    console.log('search ' + hash)
    wss.send('server search ' + hash)
  }

  stop() {
    console.log('stop')
    wss.send('server stop')
  }

  exit() {
    console.log('exit')
    wss.send('server exit')
  }

  addSlave() {
    console.log('addSlave')
    wss.send('server addSlave')
  }

  removeSlave() {
    console.log('removeSlave')
    wss.send('server removeSlave')
  }

  render() {
    const logs = this.state.logs;
    const listItems = logs.map((number) =>
        <li>{number}</li>
    );
    return (
        <div className="container">
          <h1 className="title">Md5 crack</h1>
          <div className="container flex">
            <div className="command">
              <div className="command-slave">
                <div className="flex-column">
                  <p>Server : {this.state.server}</p>
                </div>
                <div className="flex-column">
                  <p>Slave : {this.state.slave}</p>
                  <div className="command-button">
                    <button onClick={this.addSlave}>Add slave</button>
                    <button onClick={this.removeSlave}>remove slave</button>
                  </div>
                </div>
              </div>
              <div className="command-list">
                <div className="command-hash">
                  <form onSubmit={this.handleSubmit} className="form">
                      <label>Hash :</label>
                      <input type="text" value={this.state.value} onChange={this.handleChange} />
                    <input type="submit" value="Envoyer" className="send"/>
                  </form>
                </div>
                <div className="command-button">
                  <button onClick={this.stop}>Stop search</button>
                  <button onClick={this.exit}>kill all slave</button>
                </div>
              </div>
            </div>
            <div className="logs">
              <ul>{listItems}</ul>,
            </div>
          </div>
        </div>
    );
  }
}

export default App;
