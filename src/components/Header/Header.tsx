import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/auth.context';
import './Header.scss';

export const Header: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <header className="header">
      <nav className="header__nav">
        <ul className="header__list">
          <li className="header__item">
            <Link 
              to="/" 
              className={`header__link ${location.pathname === '/' ? 'header__link--active' : ''}`}
            >
              Home
            </Link>
          </li>
          {user && (
            <li className="header__item">
              <Link 
                to="/dashboard" 
                className={`header__link ${location.pathname === '/dashboard' ? 'header__link--active' : ''}`}
              >
                Dashboard
              </Link>
            </li>
          )}
          <li className="header__item">
            <Link 
              to="/about" 
              className={`header__link ${location.pathname === '/about' ? 'header__link--active' : ''}`}
            >
              About
            </Link>
          </li>
        </ul>
        <div className="header__auth">
          {user ? (
            <div className="header__user">
              <span className="header__user-email">{user.email}</span>
              <Link 
                to="/dashboard" 
                className="header__button"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <Link 
              to="/auth" 
              className={`header__button ${location.pathname === '/auth' ? 'header__button--active' : ''}`}
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};
