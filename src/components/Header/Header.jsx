import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import config from '../../config';
import { EDIT } from '../../constants';
import { fetchNavigationThunk } from '../../store/reducers/navigation';
import IsAllowed from '../IsAllowed/IsAllowed';
import Loader from '../Loader';
import Login from '../Login/Login';
import './Header.scss';
import Logo from './Logo';

const Header = () => {
  const gitVersion = config.GIT_VERSION;
  const siteTitle = config.SITE_TITLE;
  const feedbackUrl = config.FEEDBACK_URL;
  const themeColor = config.SITE_THEME;

  const dispatch = useDispatch();

  const isFetching = useSelector(
    (state) => state.ui.isFetching || state.navigation.isFetching || state.selectedTOS.isFetching,
  );

  return (
    <header className='header'>
      <nav className='navbar navbar-inverse container-fluid' style={{ backgroundColor: themeColor }}>
        <Link
          to='/'
          className='brand-title navbar-brand logo'
          onClick={() => dispatch(fetchNavigationThunk({ includeRelated: false }))}
        >
          <Logo />
        </Link>
        <Link
          to='/'
          className='brand-title navbar-brand'
          onClick={() => dispatch(fetchNavigationThunk({ includeRelated: false }))}
        >
          Tiedonohjaus
        </Link>
        <span className='navbar-text'>
          <small>
            {siteTitle} {gitVersion}
          </small>
        </span>
        <div className='menu'>
          <ul className='link-list'>
            <IsAllowed to={EDIT}>
              <li className='navbar-text'>
                <Link to='/bulk' className='navbar-link'>
                  Massamuutos
                </Link>
              </li>
            </IsAllowed>
            <li className='navbar-text'>
              <Link to='/search' className='navbar-link'>
                Haku
              </Link>
            </li>
            <li className='navbar-text'>
              <Link to='/accessibility' className='navbar-link'>
                Saavutettavuusseloste
              </Link>
            </li>
            <li className='navbar-text'>
              <Link to='/cookies' className='navbar-link'>
                Evästeasetukset
              </Link>
            </li>
            <li className='navbar-text'>
              <a href={feedbackUrl} target='_blank' rel='noreferrer' className='navbar-link'>
                Anna palautetta
              </a>
            </li>
          </ul>
          <Login />
        </div>
      </nav>
      <Loader show={isFetching} />
    </header>
  );
};

export default Header;
