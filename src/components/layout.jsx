import { Container} from '@chakra-ui/react'
import {Routes, Route} from "react-router-dom";
import Header from './header'
import Footer from './footer'
import Index from '../pages/index'
import BasketDetail from '../pages/basketdetail';
import Explore from '../pages/explore';
import AboutUs from '../pages/aboutus'
import { useState } from 'react';

export function Layout() {
  const [reloadBasket,setReloadBasket]=useState(false);
  return (
    <div>
      <Header h='calc(15vh)' setReloadBasket={setReloadBasket}/>
      <Container minH="container.md" maxW="container.xl" py='8'>
          <Routes>
              <Route path="/" element={<Index reloadBasket={reloadBasket} />} />
              <Route path="basket-detail/:basketid" element={<BasketDetail />} />
              <Route path="explore" element={<Explore />} />
              <Route path="aboutus" element={<AboutUs />} />
          </Routes>
      </Container>
      <Footer />
    </div>
  )
}