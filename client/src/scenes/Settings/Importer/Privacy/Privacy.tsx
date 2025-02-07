import React, { useCallback, useMemo, useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useDispatch } from 'react-redux';
import { startImportPrivacy } from '../../../../services/redux/modules/import/thunk';
import s from './index.module.css';

export default function Privacy() {
  const dispatch = useDispatch();
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);

  const onImport = useCallback(async () => {
    setLoading(true);
    if (!files) {
      return;
    }
    await dispatch(startImportPrivacy({ files }));
    setLoading(false);
  }, [files, dispatch]);

  const wrongFiles = useMemo(() => {
    if (!files) {
      return false;
    }
    return Array.from(Array(files.length).keys()).some(
      (i) => !files.item(i)?.name.startsWith('StreamingHistory'),
    );
  }, [files]);

  return (
    <div>
      <span className={s.import}>
        Here you can import previous data from Spotify privacy data. You can request them{' '}
        <a target="_blank" href="https://www.spotify.com/us/account/privacy/" rel="noreferrer">
          here
        </a>
        . It usually takes a week for them to get back to you. Once received, upload here your files
        beginning with <code>StreamingHistory</code>.
      </span>
      <label htmlFor="contained-button-file">
        <input
          accept=".json"
          id="contained-button-file"
          multiple
          type="file"
          style={{ display: 'none' }}
          onChange={(ev) => setFiles(ev.target.files)}
        />
        <Button component="span">Select your StreamingHistoryX.json files</Button>
      </label>
      {files &&
        Array.from(Array(files.length).keys()).map((i) => <div key={i}>{files.item(i)?.name}</div>)}
      {wrongFiles && (
        <span className={s.alert}>
          Some file do not being with <code>StreamingHistory</code>, import might not work
        </span>
      )}
      {files && !wrongFiles && (
        <span className={s.noalert}>Everything looks fine for the import to work</span>
      )}
      {files && (
        <div className={s.importButton}>
          {!loading && (
            <Button variant="contained" onClick={() => onImport()}>
              Import
            </Button>
          )}
          {loading && <CircularProgress size={16} />}
        </div>
      )}
    </div>
  );
}
