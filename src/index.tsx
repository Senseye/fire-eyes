import React from 'react'
import ReactDOM from 'react-dom'
import './index.scss'
import * as serviceWorker from './serviceWorker'
import Camera from './components/camera'

const App = () => <Camera />

ReactDOM.render(<App />, document.getElementById('root'))

serviceWorker.unregister()
