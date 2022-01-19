import React, { Component } from 'react';
import { w3cwebsocket as W3CWebSocket } from "websocket";

const wss = new W3CWebSocket('ws://127.0.0.1:8000');

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {isToggleOn: true};
    this.search = this.search.bind(this);
    this.stop = this.stop.bind(this);
    this.exit = this.exit.bind(this);
    this.found = this.found.bind(this);
    this.nbSlave = this.nbSlave.bind(this);
    this.addSlave = this.addSlave.bind(this);
    this.removeSlave = this.removeSlave.bind(this);
  }

  componentWillMount() {
    wss.onopen = () => {
      wss.send('server')
    };

    wss.onmessage = (event) => {
      console.log('get : ' + event.data)
      // const json = JSON.parse(event.data);
      // console.log()
      // console.log(event);
    }
  }

  search() {
    console.log('search')
    wss.send('server search')
  }

  stop() {
    console.log('stop')
    wss.send('server stop')
  }

  exit() {
    console.log('exit')
    wss.send('server exit')
  }

  // for test delete after
  found() {
    console.log('found')
    wss.send('found 1 2')
  }

  nbSlave() {
    console.log('nbSlave')
    wss.send('server nbSlave')
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
    return (
        <div>
          Ws tu connais
          <button onClick={this.search}>search</button>
          <button onClick={this.stop}>stop</button>
          <button onClick={this.exit}>exit</button>
          <button onClick={this.found}>found 1 2</button>
          <button onClick={this.nbSlave}>nbSlave</button>
          <button onClick={this.addSlave}>Add slave</button>
          <button onClick={this.removeSlave}>remove slave</button>
        </div>
    );
  }
}

export default App;
