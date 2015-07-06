import React from 'react';
import Flummox from 'flummox';
import FluxComponent from 'flummox/component';

import GameActions from './actions';
import GameStore from './store';

import Bluff from './bluff.jsx';

class Flux extends Flummox {
  constructor() {
    super();

    this.createActions('game', GameActions);
    this.createStore('game', GameStore, this);
  }
}

const flux = new Flux();

React.render(
  <FluxComponent flux={flux}>
    <Bluff />
  </FluxComponent>,
  document.getElementById('bluff')
);
