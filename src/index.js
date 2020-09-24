import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const numberOfCols = 3;
const numberOfRows = 3;

function Square(props) {
  return (
    <button
      className={'square' + (props.isWon ? ' won-square' : '')}
      onClick={props.onClick}
    >
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        isWon={this.props.isSquareWon[i]}
      />
    );
  }

  render() {
    let content = [];

    for (let row = 0; row < numberOfRows; row++) {
      let buttons = [];
      for (let col = 0; col < numberOfCols; col++) {
        buttons.push(this.renderSquare(row * numberOfCols + col));
      }

      content.push(<div className="board-row">{buttons}</div>);
    }

    return (
      <div>
        {content}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastClickedSquare: null,
      }],
      stepNumber: 0,
      xIsNext: true,
      sortHistoryAscending: true,
      wonSquares: [],
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();

    if (calculateWinner(squares) || squares[i]) {
      return;
    }

    squares[i] = this.state.xIsNext ? 'X' : 'O';

    const winner = calculateWinner(squares);

    this.setState({
      history: history.concat([{
        squares: squares,
        lastClickedSquare: i,
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
      wonSquares: winner ? winner.wonSquares : null,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  toggleSorting() {
    this.setState({
      sortHistoryAscending: !this.state.sortHistoryAscending,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = history.map((step, move) => {
      const lastClickedSquare = step.lastClickedSquare;
      const col = (lastClickedSquare % numberOfCols) + 1;
      const row = Math.floor(lastClickedSquare / numberOfCols) + 1;

      const desc = move
        ? 'Go to move #' + move + ' (' + col + ', ' + row + ')'
        : 'Go to game start';
      return (
        <li key={move}>
          <button
            onClick={() => this.jumpTo(move)}
            className={move === this.state.stepNumber ? 'currently-selected' : ''}
          >
            {desc}
          </button>
        </li>
      );
    });

    if (!this.state.sortHistoryAscending) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner.winner;
    }
    else {
      if (current.squares.filter(val => val === null).length == 0) {
        status = 'Draw';
      }
      else {
        status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
      }
    }

    const wonSquares = this.state.wonSquares;
    let isSquareWon = Array(9).fill(false);
    
    if (winner && winner.wonSquares) {
      for (let i = 0; i < winner.wonSquares.length; i++) {
        isSquareWon[winner.wonSquares[i]] = true;
      }
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            isSquareWon={isSquareWon}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <div>
            <button
              onClick={() => this.toggleSorting()}
            >
              {'Sort ' + (this.state.sortHistoryAscending ? 'descending' : 'ascending')}
            </button>
          </div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        wonSquares: lines[i],
      };
    }
  }
  return null;
}