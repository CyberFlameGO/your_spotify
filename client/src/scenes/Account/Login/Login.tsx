import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUser } from '../../../services/redux/modules/user/selector';
import { getSpotifyLogUrl } from '../../../services/tools';
import s from '../index.module.css';

export default function Login() {
  const navigate = useNavigate();
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [navigate, user]);

  return (
    <div className={s.root}>
      <h1 className={s.title}>Your Spotify</h1>
      <span className={s.welcome}>
        To access your personal dashboard, please login through Spotify
      </span>
      <div>
        <a className={s.link} href={getSpotifyLogUrl()}>
          Login with Spotify
        </a>
      </div>
    </div>
  );
}
