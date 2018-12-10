import React, { Component } from 'react';

export class LineInput extends Component {
    constructor(props) {
      super(props);
      this.state = {value: ''};
      this.item = props.item;
      this.parent = props.parent;
      this.handleChange = this.handleChange.bind(this);
    }

    getValue() {
        return this.state.value;
    }
  
    handleChange(event) {
      this.item.content = event.target.value;
      this.parent.updatePoem();
      this.setState({value: event.target.value});
    }
  
    render() {
      return (
        <input className="lineInput" type="text" value={this.state.value} onChange={this.handleChange} />
      );
    }
}