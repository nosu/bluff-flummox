import { Actions } from 'flummox';

class GameActions extends Actions {

  callBid(newCellIdx, newBidPips, newBidNum) {
    console.log('callBid action called');
    console.log('newCellIdx: ' + newCellIdx);
    console.log('newBidPips: ' + newBidPips);
    console.log('newBidNum: ' + newBidNum);
    return {
      newCellIdx: newCellIdx,
      newBidPips: newBidPips,
      newBidNum: newBidNum,
    };
  }

  callBluff(playerIdx) {
    return playerIdx;
  }

}

export default GameActions;
