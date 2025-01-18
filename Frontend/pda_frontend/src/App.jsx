import Signin from './pages/Signin';
import Home from './pages/Home';
import Aboutus from './pages/AboutUs';
import { Route, Routes } from 'react-router-dom';

function App() {

  return (
      <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/home" element={<Home />} />
          <Route path="/aboutus" element={<Aboutus />} />
      </Routes>
  );
}

export default App;
