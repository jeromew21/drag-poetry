import React, { Component } from 'react';
import { LineInput } from './inputs.js';
import logo from './logo.svg';
import './App.css';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// fake data generator
const getItems = count =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${k}`,
    content: "",
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};


const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  padding: 8 * 2,
  margin: `0 0 8px 0`,

  // change background colour if dragging
  background: isDragging ? 'aliceblue' : 'grey',

  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = isDraggingOver => ({
  background: 'white',//isDraggingOver ? 'white' : 'lightgrey',
  padding: 8,
  width: 500,
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: getItems(4),
      poem: "",
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.updatePoem = this.updatePoem.bind(this);
    this.newLine = this.newLine.bind(this);
    this.getPoem = this.getPoem.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = reorder(
      this.state.items,
      result.source.index,
      result.destination.index
    );

    this.setState({
      items: items,
    }, this.updatePoem);
  }

  updatePoem() {
    const poem = this.state.items.map(k => {
      return <div>{k.content}</div>;
    })

    this.setState({
      poem: poem,
    });
  }

  newLine() {
    const item = {id: `item-${this.state.items.length}`, content: ""};
    this.setState(prevState => ({
      items: [...prevState.items, item]
    }));
  }

  getPoem() {
    return this.state.poem
  }

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <div className="row">
        <div className="col-md-6">
          <button className="btn" onClick={this.newLine}>New line</button>
          <DragDropContext onDragEnd={this.onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                >
                  {this.state.items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <span className="handle" style={{fontSize: 20}}>= </span>
                          <LineInput item={item} parent={this} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="col-md-6">
          {this.getPoem()}
        </div>
      </div>
    );
  }
}


export default App;
