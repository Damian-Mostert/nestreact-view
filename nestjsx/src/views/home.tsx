import { Client, Use, Component, Server, Render } from '@damian88/nestjsx'
import React from 'react'
@Client()
@Use({

})
class ClientSide {
  @Context() UserContext(){
    const [test,setTest] = React.useState("")

    return {
      test
    }
  }
  @Component('div') Welcome() {
    const [test,setTest] = React.useState("")
    this.UserContext
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        background: 'linear-gradient(to right, #4e54c8, #8f94fb)',
        color: 'white',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          👋 Welcome to <code>@damian88/nestjsx</code>
        </h1>
        <p style={{ fontSize: '1.2rem', maxWidth: '600px', textAlign: 'center' }}>
          This is your first server-rendered component using your own custom JSX SSR framework.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <button
            onClick={() => alert('🔥 Let’s build something cool!')}
            style={{
              padding: '0.8rem 1.5rem',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '8px',
              background: 'white',
              color: '#4e54c8',
              cursor: 'pointer',
              transition: '0.3s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#ddd'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'white'
            }}
          >
            Get Started
          </button>
        </div>
      </div>
    )
  }
}

@Server()
class WelcomePage {
  @Render() render({ Client ,props }: { Client: ClientSide, props:{title:string} }) {
    return (
      <html>
        <head>
          <title>{props.title}</title>
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <Client.Welcome />
        </body>
      </html>
    )
  }
}
