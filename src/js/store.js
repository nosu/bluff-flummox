import { Store } from 'flummox';
import { Map, List, Range } from 'immutable';

class GameStore extends Store {

  constructor(flux) {
    super();

    const gameActions = flux.getActions('game');
    this.register(gameActions.callBid, this.handleBid);
    this.register(gameActions.callBluff, this.handleBluff);

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

  handleBid(newCellIdx, newBidPips, newBidNum) {
    this.setState((state, props) => ({
      curCellIdx: newCellIdx,
      curBid: Map({p: newBidPips, n: newBidNum}),
    }));
  }

  cpuPlayTurn(playerIdx) {
    if(playerIdx >= 4) {
      this.setState((state, props) => ({
        playerIdx: 0,
      }));
      return true;
    }
    const { curCellIdx, players } = this.state;
    const player = players.get(playerIdx);
    const playerDices = player.get('dices');
    const availableCells = this.state.cells.slice(curCellIdx + 1);
    const nextStarCell = availableCells
      .filter(cell => cell.get('p') == "star")
      .first();
    const nextNumCell = availableCells
      .filter(cell => cell.get('p') != "star")
      .first();
    console.log('nextStarCell: ' + nextStarCell.get('n'));
    console.log('nextNumCell: ' + nextNumCell.get('n'));

    const playerDiceCntByPips = List([0, 0, 0, 0, 0, 0])
      .map((count, index) => myDices.filter(dice => dice == index).count());
    const otherDicesCnt = this.state.players
      .delete(player.get('num'))
      .map(otherPlayer => otherPlayer.get('dices'))
      .flatten()
      .count();
    const expectedDiceCounts = Map({
      star: otherDicesCount/6 + myDiceCounts.get(0),
      num: otherDicesCount/3 + myDiceCounts.slice(1).max()
    });

    // If the value is bigger, the bid become safer
    const safetyOfNextStar = expectedDiceCounts.get('star') - nextStarCell.get('n');
    const safetyOfNextNum  = expectedDiceCounts.get('num') - nextNumCell.get('n');
    console.log('safetyOfNextStar: ' + safetyOfNextStar);
    console.log('safetyOfNextNum: ' + safetyOfNextNum);

    if(safetyOfNextStar >= safetyOfNextNum) {
      this.setState((state, props) => ({
        curBid: nextStarCell,
        curCellIdx: state.cells.indexOf(nextStarCell),
        prevPlayerIdx: playerIdx,
        curPlayerIdx: playerIdx + 1,
      }), function() {
        cpuPlayTurn(playerIdx + 1);
      });
    } else {
      this.setState((state, props) => ({
        curBid: nextNumCell.update('p', p => playerDiceCntByPips.slice(1).indexOf(playerDiceCntByPips.slice(1).max())),
        curCellIdx: state.cells.indexOf(nextNumCell),
        prevPlayerIdx: playerIdx,
        curPlayerIdx: playerIdx + 1,
      }), function() {
        cpuPlayTurn(playerIdx + 1);
      });
    }
    console.log('Player' + player.get('num') + ' move dice(pips: ' + this.state.curBid.get('p') + ') to ' + this.state.curBidPosition);

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
