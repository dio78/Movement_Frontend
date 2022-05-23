import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      <main>
      <h1>Welcome to React Router!</h1>
        <h2>Welcome to the homepage!</h2>
        <p>You can do this, I believe in you.</p>
      </main>
      <nav>
        <Link to="/about">Skeleton</Link>
      </nav>
      <nav>
      <Link to="/upload">Upload</Link>
      </nav>
    </>
  );
}




export default Home