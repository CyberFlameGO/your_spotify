import React, { useCallback, useState } from 'react';
import { Drawer, IconButton, useMediaQuery } from '@mui/material';
import { Menu } from '@mui/icons-material';
import clsx from 'clsx';
import s from './index.module.css';
import Sider from './Sider';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [open, setOpen] = useState(false);
  const showSider = !useMediaQuery('(max-width: 900px)');

  const drawer = useCallback(() => {
    setOpen((old) => !old);
  }, []);

  return (
    <div className={s.root}>
      {!showSider && (
        <Drawer open={open} anchor="left" onClose={() => setOpen(false)}>
          <Sider />
        </Drawer>
      )}
      <section className={s.sider}>{showSider && <Sider />}</section>
      <section
        className={clsx({
          [s.content]: true,
          [s.contentdrawer]: showSider,
        })}>
        {!showSider && (
          <IconButton onClick={drawer} className={s.drawerbutton}>
            <Menu />
          </IconButton>
        )}
        {children}
      </section>
    </div>
  );
}
