import React from 'react';
import Flummox from 'flummox';
import FluxComponent from 'flummox/component';
import { Map, List, Range } from 'immutable';

class Bluff extends React.Component {

  render() {
    return (
      <div className='container'>
        <FluxComponent connectToStores={{
          game: store => ({
            cells: store.state.cells,
            curCellIdx: store.state.curCellIdx,
            curBid: store.state.curBid,
            players: store.state.players,
            isDiceOpen: store.state.isDiceOpen,
            message: store.state.message,
            curPlayerIdx: store.state.curPlayerIdx,
          })
        }}>
          <Board />
          <OtherPlayers />
          <MyPlayer />
          <Outcome />
          <Interface />
        </FluxComponent>
      </div>
    );
  }

}

class Board extends React.Component {

  render() {
    const {cells, curCellIdx, curBid} = this.props;
    const dice = <Dice pips={curBid.get('p')} />;
    // console.log('cells: ' + cells);
    console.log('curCellIdx: ', curCellIdx);

    return (
      <div className='board'>
        {cells
          .slice(curCellIdx, curCellIdx + 3)
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

}

class Dice extends React.Component {

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

}

class OtherPlayers extends React.Component {

  render() {
    const { players, isDiceOpen } = this.props;

    return (
      <div className='otherPlayers clearfix'>
        {players.slice(1).map((player, index) =>
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

}

class MyPlayer extends React.Component {

  render() {
    const { players } = this.props;

    return (
      <div className='myPlayer clearfix'>
        <div className='myPlayer__name'>You</div>
        <div className='myPlayer__dices'>
          {players.get(0).get('dices').map(
            (dice, index) => <div key={index} className='myPlayer__dices__dice'><Dice key={index} pips={dice} /></div>
          )}
        </div>
      </div>
    );
  }

}

class Interface extends React.Component {

  constructor(props) {
    super(props);

    var bidPipsList = "num";
    if(props.cells.get(props.curCellIdx).get('p') == "star") {
       bidPipsList = "star";
    }
    this.state = {
      bidPipsList: bidPipsList,
      newCellIdx: 0,
      newBidPips: props.curBid.get('p'),
      newBidNum: props.curBid.get('n'),
      selectedCellValue: props.cells.get(props.curCellIdx + 1).get('p') + "_" + props.cells.get(props.curCellIdx + 1).get('n'),
      selectedPipsValue: props.curBid.get('p'),
    };
  }

  onChangeSelectedCell(event){
    console.log('selectedIndex: ' + event.target.selectedIndex);
    // console.log('cells: ' + this.props.cells);

    // Update the pips list
    if(event.target.value.indexOf("num") == 0) {
      this.setState((state, props) => ({
        bidPipsList: "num",
        selectedPipsValue: '1',
      }));
    } else {
      this.setState((state, props) => ({
        bidPipsList: "star",
        selectedPipsValue: '0',
      }));
    }

    // Update newCellIdx
    // selectedIndex starts from 1
    var selectedIndex = event.target.selectedIndex;
    this.setState((state, props) => ({
      newCellIdx: selectedIndex + props.curCellIdx + 1
    }), function() {
      console.log('newCellIdx updated to: ' + this.state.newCellIdx);
    });
    this.setState((state, props) => ({
      selectedCellValue: props.cells.get(state.newCellIdx).get('p') + "_" + props.cells.get(state.newCellIdx).get('n')
    }));

    // Update newSelectedNum
    var newBidNum = parseInt(event.target.value.split('_')[1]);
    console.log('newBidNum will be updated to: ' + parseInt(event.target.value.split('_')[1]));
    this.setState((state, props) => ({newBidNum: newBidNum}), function() {
      console.log('newBidNum was updated to: ' + this.state.newBidNum);
    }.bind(this));
  }

  onChangeSelectedPips(event){
    // Update the selected pips
    const newBidPips = event.target.value;
    if(event.target.value == '*') {
      this.setState((state, props) => {newBidPips: "star"});
      this.setState((state, props) => {selectedPipsValue: '0'});
    } else {
      this.setState((state, props) => {newBidPips: newBidPips});
      this.setState((state, props) => {selectedPipsValue: newBidPips});
    }
  }

  handleBidBtn() {
    this.props.flux.getActions('game')
      .callBid(this.state.newCellIdx, this.state.newBidPips, this.state.newBidNum);
  }

  handleBluffBtn() {
    this.props.flux.getActions('game').callBluff();
  }

  render() {
    const { cells, curCellIdx, curBid, curPlayerIdx } = this.props;
    const { selectedCellValue, selectedPipsValue, newCellIdx } = this.state;
    var that = this;

    // Create options which cell to move
    var cellOptions = cells.slice(curCellIdx + 1).map((cell, index) =>
      <option key={index} value={cell.get('p') + "_" + cell.get('n')}>
        {"Cell: " + cell.get('p') + "  x " + cell.get('n') + " dice(s)"}
      </option>
    );

    // Create options; star or 1-5
    var pipsOptionsStar = <option key='1' value='0'>*</option>;
    var pipsOptionsNum = List([1, 2, 3, 4, 5]).map(
      i => <option key={i} value={i}>{i}</option>
    );
    var pipsOptions = (this.state.bidPipsList == "star")? pipsOptionsStar : pipsOptionsNum;

    // Create buttons
    var bidBtn;
    var bluffBtn;
    // if (curPlayerIdx == 0) {
      bidBtn   = <button className='btn' onClick={this.handleBidBtn.bind(this)}>Bid</button>;
      bluffBtn = <button className='btn' onClick={this.handleBluffBtn.bind(this)}>Call Bluff!</button>;
    // } else {
      // bidBtn   = <button className='btn' onClick={that.handleBidBtn} disabled='disabled'>Bid</button>;
      // bluffBtn = <button className='btn' onClick={that.handleBluffBtn} disalbed='disabled'>Call Bluff!</button>;
    // }

    return (
      <div className='interface'>
        <div className='interface__bid'>
          <select className='interface__bid__selectCell' value={selectedCellValue} onChange={this.onChangeSelectedCell.bind(this)}>{cellOptions}</select>
          <select className='interface__bid__selectPips' value={selectedPipsValue} onChange={this.onChangeSelectedPips.bind(this)}>{pipsOptions}</select>
          {bidBtn}
        </div>
        <div className='interface__bluff'>
          {bluffBtn}
        </div>
      </div>
    );
  }
}

class Outcome extends React.Component {

  render() {
    const { curPlayerIdx, message } = this.props;
    return (
      <div>{message}</div>
    );
  }

}

export default Bluff;
