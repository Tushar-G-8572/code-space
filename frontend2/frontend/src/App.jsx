import React from 'react'
import {Button} from './components/ui/button'

const App = () => {
  return (
    <div className='h-screen w-full bg-gray-400 flex  justify-center items-center'>
      <Button className='cursor-pointer px-4 py-2 h-10 w-40 active:scale-90' >
        Click Me
      </Button>
    </div>
  )
}

export default App