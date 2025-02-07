import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { Skeleton } from '@mui/material';
import { api } from '../../../services/api';
import { useAPI } from '../../../services/hooks';
import { Timesplit } from '../../../services/types';
import TitleCard from '../../TitleCard';
import { ImplementedCardProps } from '../types';
import s from '../index.module.css';
import { getLastPeriod, getPercentMore } from '../../../services/stats';
import { selectIntervalDetail } from '../../../services/redux/modules/user/selector';

interface SongsListenedProps extends ImplementedCardProps {}

export default function SongsListened({ className }: SongsListenedProps) {
  const { interval, unit } = useSelector(selectIntervalDetail);
  const result = useAPI(api.songsPer, interval.start, interval.end, Timesplit.all);
  const lastPeriod = useMemo(() => getLastPeriod(interval.start, interval.end), [interval]);
  const resultOld = useAPI(api.songsPer, lastPeriod.start, lastPeriod.end, Timesplit.all);

  if (!result || !resultOld) {
    return (
      <TitleCard title="Songs listened" className={className} fade>
        <div className={s.root}>
          <span className={s.number}>
            <Skeleton width={50} />
          </span>
          <span>
            <Skeleton width={200} />
          </span>
        </div>
      </TitleCard>
    );
  }

  const count = result[0]?.count ?? 0;
  const oldCount = resultOld[0]?.count ?? 0;

  const different = result[0]?.differents ?? 0;

  const percentMore = getPercentMore(oldCount, count);

  return (
    <TitleCard title="Songs listened" className={className} fade>
      <div className={s.root}>
        <div className={s.twonumbers}>
          <span className={s.number}>{count}</span>
          <span className={s.number}>{different} diff.</span>
        </div>
        <span>
          <strong
            className={clsx({
              [s.more]: percentMore >= 0,
              [s.less]: percentMore < 0,
            })}>
            {Math.abs(percentMore)}%
          </strong>
          &nbsp;{percentMore < 0 ? 'less' : 'more'} than last {unit}
        </span>
      </div>
    </TitleCard>
  );
}
