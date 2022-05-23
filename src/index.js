import { createRoot } from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet
} from "react-router-dom";
import App from "./App";
import Create from "./components/Create";
import Skeleton from './components/Skeleton';
import Upload from './components/Upload';
import Home from './components/Home';
import Login from './components/Login';
import Library from './components/Library'
import Learn from './components/Learn';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

const ProtectedRoute = ({
  user,
  redirectPath = '/login',
  children,
}) => {
  if (!localStorage.token) {
    return <Navigate to={redirectPath} replace={true} />;
  }
  debugger;

  return <Outlet />
};

root.render(
  <BrowserRouter>
    <Routes>
      {/* <Route path="/login" element={<Login />} /> */}
      <Route path="/login" element={<Login />}></Route>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/library" element={<Library />} />
          <Route path="/skeleton" element={<Skeleton />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/learn/:id" element={<Learn />} />
        </Route>
      </Route>
    </Routes>
  </BrowserRouter>
);