import React from 'react';
import { Map, List, Range } from 'immutable';

class Bluff extends React.Component {

  getInitialState() {
    return {};
  },

  callBid(newBidPosition, newPips, newNum) {
    console.log('callBid - newBidPos: ' + newBidPosition);
    console.log('callBid - newPips: ' + newPips);
    console.log('callBid - newNum: ' + newNum);
    this.updateCurStatus(
      Map({p: newPips, n: newNum}),
      newBidPosition,
      this.state.curPlayer,
      this.getNextPlayer()
    );
    this.playOtherPlayers();
  },

  playOtherPlayers() {
    // this.state.players
    //   .slice(1)
    //   .filter(player => player.get('status') == "active")
    //   .map(player => this.playTurn(player));
    this.playTurn(this.state.players.get(1));
    this.playTurn(this.state.players.get(2));
    this.playTurn(this.state.players.get(3));
  },

  updateCurStatus(curBid, curBidPosition, previousPlayer, curPlayer) {
    console.log('updateCurStatus: '
      + curBid + ', ' + curBidPosition + ', ' + previousPlayer + ', ' + curPlayer);
    this.setState((state, props) => ({curBid: curBid}));
    this.setState((state, props) => ({curBidPosition: curBidPosition}));
    this.setState((state, props) => ({previousPlayer: previousPlayer}));
    this.setState((state, props) => ({curPlayer: curPlayer}));
  },

  playTurn(player) {
    var availableCells = this.state.cells.slice(this.state.curBidPosition + 1);
    var nextStarCell = availableCells
      .filter(cell => cell.get('p') == "star")
      .first();
    var nextNumCell = availableCells
      .filter(cell => cell.get('p') != "star")
      .first();
    console.log('nextStarCell: ' + nextStarCell.get('n'));
    console.log('nextNumCell: ' + nextNumCell.get('n'));
    var myDices = player.get('dices');
    var myDiceCounts = List([0, 0, 0, 0, 0, 0])
      .map((count, index) => myDices.filter(dice => dice == index).count());
    var otherDicesCount = this.state.players
      .delete(player.get('num'))
      .map(otherPlayer => otherPlayer.get('dices'))
      .flatten()
      .count();
    var expectedDiceCounts = Map({
      star: otherDicesCount/6 + myDiceCounts.get(0),
      num: otherDicesCount/3 + myDiceCounts.slice(1).max()
    });
    // If the value is bigger, the bid become safer
    var safetyOfNextStar = expectedDiceCounts.get('star') - nextStarCell.get('n');
    var safetyOfNextNum  = expectedDiceCounts.get('num') - nextNumCell.get('n');
    console.log('safetyOfNextStar: ' + safetyOfNextStar);
    console.log('safetyOfNextNum: ' + safetyOfNextNum);

    if(safetyOfNextStar >= safetyOfNextNum) {
      this.updateCurStatus(
        nextStarCell,
        this.state.cells.indexOf(nextStarCell),
        this.state.curPlayer,
        this.getNextPlayer()
      );
    } else {
      this.updateCurStatus(
        nextNumCell.update('p', p => myDiceCounts.slice(1).indexOf(myDiceCounts.slice(1).max())),
        this.state.cells.indexOf(nextNumCell),
        this.state.curPlayer,
        this.getNextPlayer()
      );
    }
    console.log('Player' + player.get('num') + ' move dice(pips: ' + this.state.curBid.get('p') + ') to ' + this.state.curBidPosition);
  },

  callBluff() {
    var bidPips = this.state.curBidPips;
    var bidNum = this.state.curBid.get('n');
    var resultNum = this.state.otherPlayers
      .map(player => player.get('dices'))
      .push(this.state.myPlayer.get('dices'))
      .flatten()
      .filter(this.state.curBidPips)
      .count();
    if(resultNum < bidNum) {
      // if the bluff call succeeds,
      // the player who made the bid loses dices
      this.loseDices(this.state.previousPlayer, (bidnum - resultNum));
    } else if(resultNum == bidNum) {
      // if the bluff call fails and the bid and result is the same,
      // all players, except the player made the bid, lose 1 dice each
      this.state.players.map(function(player, index) {
        if(index == this.state.previousPlayer) {
          return player;
        } else {
          this.loseDices(player, 1);
        }
      });
    } else if(resultNum > bidNum) {
      // if the bluff call fails,
      // the player who called bluff loses dices
      this.loseDices(this.state.curPlayer, (resultNum - bidNum));
    }

    if(this.state.players(0).get('dices').size == 0) {
      this.gameover();
    } else {
      this.setupNextPhase();
    }
  },

  setupNextPhase() {
    this.shuffleDices();
  },

  loseDices(playerId, num) {
    this.setState(({players}) => ({
      players: players.map(function(player, index) {
        // If this player is the target player
        if(index == playerId) {
          return player.update('dices', function(list) {
            if(list.count() >= num) {
              return list.slice(0, (list.count() - num));
            } else {
              this.updateUserStatus(index, 'inactive');
              return list.empty();
            }
          });
        } else {
          // Change nothing about other players
          return player;
        }
      })
    }));
  },

  updateUserStatus(playerId, status) {
    this.setState(({players}) => ({
      players: players.map(function(player, index) {
        if(player == playerId) {
          return player.update('status', s => status);
        } else {
          return player;
        }
      })
    }));
  },

  getNextPlayer() {
    for(var i = 1; i <= 3; i++) {
      var nextCheckPlayer = (this.state.curPlayer + i) % 4;
      console.log('getNextPlayer - Now Checking Player ' + nextCheckPlayer);
      if(this.state.players.get(nextCheckPlayer).get('status') == "active") {
        console.log('getNextPlayer return: ' + i);
        return i;
      }
    }
    // It must not be happened
    console.log('getNextPlayer failed');
    return nil;
  },

  render() {
    return (
      <div className='container'>
        <Board
          curBid={this.state.curBid}
          curBidPosition={this.state.curBidPosition}
          cells={this.state.cells} />
        <OtherPlayers players={this.state.players.slice(1, 4)} isDiceOpen={this.state.isDiceOpen} />
        <MyPlayer player={this.state.players.get(0)} />
        <Outcome message={this.state.message} curPlayer={this.state.curPlayer} />
        <Interface
          cells={this.state.cells}
          curPlayer={this.state.curPlayer}
          curBid={this.state.curBid}
          curBidPosition={this.state.curBidPosition}
          callBid={this.callBid}
          callBluff={this.callBluff} />
      </div>
    );
  }

});

var Board = React.createClass({

  render() {
    var that = this;
    var dice = <Dice pips={this.props.curBid.get('p')} />;

    return (
      // TODO: place the dice on the first cell
      <div className='board'>
        {this.props.cells
          .slice(this.props.curBidPosition, this.props.curBidPosition + 3)
          .map((cell, index) =>
          <div key={index} className='board__cell'>
            <div className='board__cell__pips'>{cell.get('p')}</div>
            <div className='board__cell__num'>{cell.get('n')}</div>
          </div>)
        }
        <div className='board__margin'><div className='board__margin__arrow'></div></div>
      </div>
    );
  }

});

var Dice = React.createClass({

  render() {
    if(this.props.size == "small") {
      return (
        <div className='dice dice-small'>
          <span className='dice__pips dice__pips-small'>{(this.props.pips == 0)? "★" : this.props.pips}</span>
        </div>
      );
    } else {
      return (
        <div className='dice'>
          <span className='dice__pips'>{(this.props.pips == 0)? "★" : this.props.pips}</span>
        </div>
      );
    }
  }

});

var OtherPlayers = React.createClass({

  render() {
    var isDiceOpen = this.props.isDiceOpen;
    return (
      <div className='otherPlayers clearfix'>
        {this.props.players.map((player, index) =>
          <div key={index} className='otherPlayer'>
            <div className='otherPlayer__name'>CPU {index + 1}</div>
            <div className='otherPlayer__dices'>
              {player.get('dices').map(function(dice, index) {
                if(isDiceOpen) {
                  return <div key={index} className='otherPlayer__dices_dice'><Dice pips={dice} size='small'/></div>;
                } else {
                  return <div key={index} className='otherPlayer__dices_dice'><Dice pips='?' size='small'/></div>;
                }
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

});

var MyPlayer = React.createClass({

  render() {
    return (
      <div className='myPlayer clearfix'>
        <div className='myPlayer__name'>You</div>
        <div className='myPlayer__dices'>
          {this.props.player.get('dices').map(
            (dice, index) => <div key={index} className='myPlayer__dices__dice'><Dice key={index} pips={dice} /></div>
          )}
        </div>
      </div>
    );
  }

});

var Interface = React.createClass({

  getInitialState(){
    var bidPipsList = "num";
    if(this.props.cells.get(this.props.curBidPosition).get('p') == "star") {
       bidPipsList = "star";
    }
    return {
      bidPipsList: bidPipsList,
      newSelectedPosition: 0,
      newSelectedPips: this.props.curBid.get('p'),
      newSelectedNum: this.props.curBid.get('n')
    };
  },

  onChangeSelectedCell(event){
    console.log(event.target.selectedIndex);

    // Update the pips list
    if(event.target.value.indexOf("num") == 0) {
      this.setState((state, props) => ({bidPipsList: "num"}));
    } else {
      this.setState((state, props) => ({bidPipsList: "star"}));
    }

    // Update newSelectedPosition
    var selectedIndex = event.target.selectedIndex;
    this.setState((state, props, event) => ({
      newSelectedPosition: selectedIndex
    }));

    // Update newSelectedNum
    var newSelectedNum = parseInt(event.target.value.split('_')[1]);
    console.log('selectedNum will be updated to: ' + parseInt(event.target.value.split('_')[1]));
    this.setState((state, props) => ({
      newSelectedNum: newSelectedNum
    }));
  },

  onChangeSelectedPips(event){
    // Update the selected pips
    if(event.target.value == '*') {
      this.setState({newSelectedPips: "star"});
    } else {
      this.setState({newSelectedPips: event.target.value});
    }
  },

  handleBidBtn(){
    console.log('handleBitBtn');
    this.props.callBid(this.state.newSelectedPosition, this.state.newSelectedPips, this.state.newSelectedNum);
  },

  handleBluffBtn(){
    this.props.callBluff()
  },

  render(){
    var that = this;
    var cells = this.props.cells;
    var curBidPosition = this.props.curBidPosition;
    var newSelectedCell = cells.get(this.state.newSelectedPosition).get('p') + "_" + cells.get(this.state.newSelectedPosition).get('n');

    // Create options which cell to move
    var cellOptions = cells.slice(this.props.curBidPosition).map((cell, index) =>
      <option key={index} value={cell.get('p') + "_" + cell.get('n')}>
        {"Cell: " + cell.get('p') + "  x " + cell.get('n') + " dice(s)"}
      </option>
    );

    // Create options; star or 1-5
    var pipsOptionsStar = <option key='1' value='star'>*</option>;
    var pipsOptionsNum = List([1, 2, 3, 4, 5]).map(
      i => <option key={i} value={i}>{i}</option>
    );
    var pipsOptions = (this.state.bidPipsList == "star")? pipsOptionsStar : pipsOptionsNum;

    // Create buttons
    var bidBtn;
    var bluffBtn;
    // if (this.curPlayer == 0) {
      bidBtn   = <button className='btn' onClick={that.handleBidBtn}>Bid</button>;
      bluffBtn = <button className='btn' onClick={that.handleBluffBtn}>Call Bluff!</button>;
    // } else {
    //   bidBtn   = <button className='btn' onClick={that.handleBidBtn} disabled>Bid</button>;
    //   bluffBtn = <button className='btn' onClick={that.handleBluffBtn} disalbed>Call Bluff!</button>;
    // }

    return (
      <div className='interface'>
        <div className='interface__bid'>
          <select className='interface__bid__selectCell' value={newSelectedCell} onChange={this.onChangeSelectedCell}>{cellOptions}</select>
          <select className='interface__bid__selectPips' onChange={this.onChangeSelectedPips}>{pipsOptions}</select>
          {bidBtn}
        </div>
        <div className='interface__bluff'>
          {bluffBtn}
        </div>
      </div>
    );
  }

});

var Outcome = React.createClass({

  render() {
    return (
      <div>Turn: Player {this.props.curPlayer}</div>
    );
  }

});

export default Bluff;
