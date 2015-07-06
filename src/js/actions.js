import { Actions } from 'flummox';

class GameActions extends Actions {

  callBid(newCellIdx, newBid) {
    return {
      newCellIdx: newCellIdx,
      newBid: newBid,
    };
  }

  callBluff(playerIdx) {
    return playerIdx;
  }

}

export default GameActions;
