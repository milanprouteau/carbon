import React from 'react';
import './Header.scss';

export const Header: React.FC = () => {
  return (
    <header className="header">
      <nav className="header__nav">
        <ul className="header__list">
          <li className="header__item">
            <a href="/" className="header__link header__link--active">Home</a>
          </li>
          <li className="header__item">
            <a href="/about" className="header__link">About</a>
          </li>
        </ul>
      </nav>
    </header>
  );
};
