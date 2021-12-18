import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ClaimNFT from './pages/ClaimNFT';
import NFTImageUpload from './pages/NFTImageUpload';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route exact path='/' element={ <ClaimNFT />} />
      <Route path='/upload' element={ <NFTImageUpload />} /> 
    </Routes>  
  </BrowserRouter>
);

export default App;