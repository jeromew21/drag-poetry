import React, { Component } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { LineInput } from './inputs.js';
import logo from './logo.svg';
import './App.css';

// fake data generator
const getItems = (count, idPrefix) =>
  Array.from({ length: count }, (v, k) => k).map(k => ({
    id: `item-${idPrefix}-${k}`,
    content: "",
  }));

// a little function to help us with reordering the result
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const shuffle = (a) => {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);

  destClone.splice(droppableDestination.index, 0, removed);

  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;

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
  width: 550,
});

class DraggyBoi extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <div>
        <span className="handle" style={{fontSize: 20}}>= </span>
        <LineInput item={this.props.item} parent={this.props.parent} />
      </div>
    )
  } 
}

class FileInput extends Component {
  constructor(props) {
    super(props)
    this.uploadFile = this.uploadFile.bind(this);
  }
  
  uploadFile(event) {
      let file = event.target.files[0];
      
      if (file) {
        let reader = new FileReader();
        const onRead = (e) => {
          let lines = reader.result.split("\n");
          lines = lines.filter((i) => {return i.length > 0});
          this.props.parent.import(lines);
        }
        reader.onloadend = onRead;
        reader.readAsText(file);
      }
  }
  
  render() {
    return <span>
      <input type="file"
      name="myFile"
      onChange={this.uploadFile} />
    </span>
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      items: getItems(4, "main"),
      poem: "",
      trash: getItems(0, "trash"),
    };
    this.onDragEnd = this.onDragEnd.bind(this);
    this.updatePoem = this.updatePoem.bind(this);
    this.newLine = this.newLine.bind(this);
    this.getPoem = this.getPoem.bind(this);
    this.import = this.import.bind(this);
    this.shuffle = this.shuffle.bind(this);
  }

  shuffle() {
    const items = shuffle(this.state.items);
    this.setState({items: items}, this.updatePoem);
  }

  import(lines) {
    const items = lines.map(k => ({
      id: `item-imported-${k}`,
      content: k,
    }));
    this.setState({items: items}, this.updatePoem);
  }

  onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
        return;
    }

    if (source.droppableId === destination.droppableId) {
        const items = reorder(
            this.getList(source.droppableId),
            source.index,
            destination.index
        );

        let state = { items: items };

        if (source.droppableId === 'trash') {
            state = { trash: items };
        }

        this.setState(state, this.updatePoem);
    } else {
      const result = move(
          this.getList(source.droppableId),
          this.getList(destination.droppableId),
          source,
          destination
      );

      this.setState({
          items: result.droppable,
          trash: result.trash
      }, this.updatePoem);
    }
  };

  updatePoem() {
    const poem = this.state.items.map(k => {
      return <div>{k.content}</div>;
    })

    this.setState({
      poem: poem,
    });
  }

  newLine() {
    const item = {id: `item-new-${this.state.items.length}`, content: ""};
    this.setState(prevState => ({
      items: [...prevState.items, item]
    }));
  }

  getPoem() {
    return this.state.poem
  }

  id2List = {
    droppable: 'items',
    trash: 'trash'
  };

  getList = id => this.state[this.id2List[id]];

  // Normally you would want to split things out into separate components.
  // But in this example everything is just done in one place for simplicity
  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        <div className="row">
          <div className="col-md-5">
            <button className="btn" onClick={this.newLine}>New line</button>
            <button className="btn" onClick={this.shuffle}>Shuffle</button>
            <span>Import: </span>
            <FileInput parent={this} />
            <div className="itemsContainer">
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
                            <DraggyBoi item={item} parent={this} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
          <div className="col-md-7">
            <div className="poem">
              {this.getPoem()}
            </div>
            <Droppable droppableId="trash">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}>
                        <h2>Trash</h2>
                        {this.state.trash.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={getItemStyle(
                                            snapshot.isDragging,
                                            provided.draggableProps.style
                                        )}>
                                        <DraggyBoi item={item} parent={this} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
              </Droppable>
          </div>
        </div>
      </DragDropContext>      
    );
  }
}


export default App;
