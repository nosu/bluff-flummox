import { Store } from 'flummox';
import { Map, List, Range } from 'immutable';

class GameStore extends Store {

  constructor(flux) {
    super();

    const gameActions = flux.getActions('game');
    this.register(gameActions.callBid, this.handleBidBtn);
    this.register(gameActions.callBluff, this.handleBluffBtn);

    // Set initial state using assignment
    this.state = {
      prevPlayerIdx: 3,
      curPlayerIdx: 0,
      curCellIdx: 0,
      curBid: Map({p: 1, n: 1}),
      cells: List([
        Map({p:"num",n:1}),Map({p:"star",n:1}),
        Map({p:"num",n:2}),Map({p:"num",n:3}),Map({p:"star",n:2}),
        Map({p:"num",n:4}),Map({p:"num",n:5}),Map({p:"star",n:3}),
        Map({p:"num",n:6}),Map({p:"num",n:7}),Map({p:"star",n:4}),
        Map({p:"num",n:8}),Map({p:"num",n:9}),Map({p:"star",n:5}),
        Map({p:"num",n:10}),Map({p:"num",n:11}),Map({p:"star",n:6}),
        Map({p:"num",n:12}),Map({p:"num",n:13}),Map({p:"star",n:7})
      ]),
      message: "Choose your action >",
      isDiceOpen: false,
      players: List([
        Map({num: 0, status: "active", dices: this.createShuffledDices(List([0, 0, 0, 0, 0])), myPlayer: true}),
        Map({num: 1, status: "active", dices: this.createShuffledDices(List([0, 0, 0, 0, 0])), cpu: 'simple'}),
        Map({num: 2, status: "active", dices: this.createShuffledDices(List([0, 0, 0, 0, 0])), cpu: 'simple'}),
        Map({num: 3, status: "active", dices: this.createShuffledDices(List([0, 0, 0, 0, 0])), cpu: 'simple'})
      ])
    };
  }

  shuffleDices() {
    this.setState(({players}) => ({
      players: players.map(
        player => player.update('dices', list => this.createShuffledDices(list))
      )
    }));
  }

  createShuffledDices(curDices) {
    return curDices.map(dice => Math.floor(Math.random() * 6));
  }

}

export default GameStore;
