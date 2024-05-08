import { Link } from 'react-router-dom';
import classes from './Home.module.scss';

function Home() {
  return (
    <div className={classes.Home}>
      <h1>Game</h1>
      <div className={classes.List}>
        <Link to="game/page-update">Game page update</Link>
        <Link to="game/update">Update a game</Link>
      </div>
      <h1>Role</h1>
      <div className={classes.List}>
        <Link to="role/add-to-user">Add role to a user</Link>
      </div>
    </div>
  );
}

export default Home;
