import React, { Component } from 'react';
import {Link} from 'react-router'
import Pubsub from 'pubsub-js'

class FotoAtualizacoes extends Component {

  constructor(props){
    super(props)
    this.state = {
      likeada : this.props.foto.likeada
    }
  }
  like(event){
    event.preventDefault()

    fetch(`https://instalura-api.herokuapp.com/api/fotos/${this.props.foto.id}/like?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`, {method:'post'})
      .then(response => {
        if(response.ok){
          return response.json()
        }else{
          throw new Error('não foi possível realizar o like da foto.')
        }
      }).then(liker => {
        this.setState({likeada:!this.state.likeada})
        Pubsub.publish('atualiza-liker', {fotoId:this.props.foto.id, liker})
      })
  }

  comenta(event){
    event.preventDefault()

    const requestInfo = {
      method:'post',
      body:JSON.stringify({texto:this.comment.value}),
      headers:new Headers({
        'Content-type':'application/json'
      })
    }

    fetch(`https://instalura-api.herokuapp.com/api/fotos/${this.props.foto.id}/comment?X-AUTH-TOKEN=${localStorage.getItem('auth-token')}`, requestInfo)
      .then(response => {
        if(response.ok){
          return response.json()
        }else{
          throw new Error('Não possível realizar o comentário.')
        }
      }).then(newComment => {
        Pubsub.publish('newComment', {fotoId:this.props.foto.id, newComment})
      })
  }

  render(){
      return (
          <section className="fotoAtualizacoes">
            <a onClick={this.like.bind(this)} className={this.state.likeada ? 'fotoAtualizacoes-like-ativo' : 'fotoAtualizacoes-like'}>Likar</a>
            <form className="fotoAtualizacoes-form" onSubmit={this.comenta.bind(this)}>
              <input type="text" placeholder="Adicione um comentário..." className="fotoAtualizacoes-form-campo" ref={input => this.comment = input}/>
              <input type="submit" value="Comentar!" className="fotoAtualizacoes-form-submit"/>
            </form>

          </section>            
      );
  }
}

class FotoInfo extends Component {

  constructor(props){
    super(props)
    this.state = {likers : this.props.foto.likers, comments: this.props.foto.comentarios}
  }

  componentWillMount(){
    Pubsub.subscribe('atualiza-liker', (topico, infoLiker) => {
      if(this.props.foto.id === infoLiker.fotoId){
        const possibleLiker = this.state.likers.find(liker => liker.login === infoLiker.liker.login)
        if(possibleLiker === undefined){
          const newLikers = this.state.likers.concat(infoLiker.liker)
          this.setState({likers:newLikers})
        }else{
          const newLikers = this.state.likers.filter(liker => liker.login !== infoLiker.liker.login)
          
          this.setState({likers:newLikers})
        }
      }
    })

    Pubsub.subscribe('newComment', (topico, newComment) => {
      if(this.props.foto.id === newComment.fotoId){
        const newComments = this.state.comments.concat(newComment.newComment)
        this.setState({comments:newComments})
      }
    })
  }

  render(){
      return (
          <div className="foto-in fo">
            <div className="foto-info-likes">
              {
                this.state.likers.map(liker => {
                  return (<Link to={`/timeline/${liker.login}`} key={liker.login}>{liker.login},</Link>)
                })
              }
              
              curtiram
            </div>

            <p className="foto-info-legenda">
              <a className="foto-info-autor">autor </a>
              {this.props.foto.comentario}
            </p>

            <ul className="foto-info-comentarios">
            {
              this.state.comments.map(comentario => {
                return <li className="comentario" key={comentario.id}>
                        <Link to={`/timeline/${comentario.login}`} className="foto-info-autor">{comentario.login} </Link>
                        {comentario.texto}
                      </li>
              })
            }
            </ul>
          </div>            
      );
  }
}

class FotoHeader extends Component {
    render(){
        return (
            <header className="foto-header">
              <figure className="foto-usuario">
                <img src={this.props.foto.urlPerfil} alt="foto do usuario"/>
                <figcaption className="foto-usuario">
                  <Link to={`/timeline/${this.props.foto.loginUsuario}`}>
                  {this.props.foto.loginUsuario}
                  </Link>  
                </figcaption>
              </figure>
              <time className="foto-data">{this.props.foto.horario}</time>
            </header>
        );
    }
}

export default class Foto extends Component {
    render(){
        return (
          <div className="foto">
            <FotoHeader foto={this.props.foto}/>
            <img alt="foto" className="foto-src" src={this.props.foto.urlFoto}/>
            <FotoInfo foto={this.props.foto}/>
            <FotoAtualizacoes foto={this.props.foto}/>
          </div>            
        );
    }
}