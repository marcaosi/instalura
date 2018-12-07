import React, { Component } from 'react';
import Foto from './Foto';
import Pubsub from 'pubsub-js'
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup'

export default class Timeline extends Component {

    constructor(){
        super();
        this.state = {fotos:[]}
    }

    carregaFotos(props){
        let urlPerfil = `https://instalura-api.herokuapp.com/api/fotos?X-AUTH-TOKEN=${localStorage.getItem("auth-token")}`
        if(props.login !== undefined){
            urlPerfil = `https://instalura-api.herokuapp.com/api/public/fotos/${props.login}`
        }

        fetch(urlPerfil)
            .then(response => response.json())
            .then(fotos => {
                this.setState({fotos})
            })
    }

    componentWillMount(){
        Pubsub.subscribe('timeline', (topico, fotos) => {
            this.setState({fotos: fotos})
        })
    }

    componentDidMount(){
        this.carregaFotos(this.props)
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.login !== undefined){
            this.carregaFotos(nextProps)
        }
    }

    render(){
        return (
        <div className="fotos container">
            <ReactCSSTransitionGroup transitionName="timeline"
                transitionEnterTimeout={500}
                transitionLeaveTimeout={300}>
                {
                    this.state.fotos.map(foto => <Foto key={foto.id} foto={foto} />)
                }
            </ReactCSSTransitionGroup>
        </div>            
        );
    }
}