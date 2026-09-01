
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

export default function Layout() {
  return (
    <>
      <Header />
      <main className="container pt-8 pb-16">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

