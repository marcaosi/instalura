import React, { Component } from 'react';
import Foto from './Foto';

export default class Timeline extends Component {

    constructor(){
        super();
        this.state = {fotos:[]}
    }

    componentDidMount(){
        fetch('https://instalura-api.herokuapp.com/api/public/fotos/rafael')
            .then(response => response.json())
            .then(fotos => {
                this.setState({fotos})
            })
    }
    render(){
        return (
        <div className="fotos container">
          {
              this.state.fotos.map(foto => <Foto key={foto.id} foto={foto} />)
          }
        </div>            
        );
    }
}