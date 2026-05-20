/**
 * usePhotoUpload — custom hook that encapsulates the upload state machine.
 *
 * Returns:
 *   { uploadFile, uploadedFile, isUploading, error, reset }
 *
 * TODO: Replace the simulated delay with a real fetch to POST /api/upload.
 */

import { useState, useCallback, useEffect, useRef } from 'react';

function usePhotoUpload() {
  const [isUploading, setIsUploading]   = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null); // { filename, fileUrl, localUrl }
  const [error, setError]               = useState(null);
  const localUrlRef = useRef(null);

  const uploadFile = useCallback(async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      if (localUrlRef.current) {
        URL.revokeObjectURL(localUrlRef.current);
      }

      const localUrl = URL.createObjectURL(file);
      localUrlRef.current = localUrl;

      const formData = new FormData();
      formData.append('photo', file);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';
      const res = await fetch(`${apiUrl}/upload`, { method: 'POST', body: formData });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      const nextUploaded = { ...data.data, localUrl };
      setUploadedFile(nextUploaded);
      return nextUploaded;
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
      if (localUrlRef.current) {
        URL.revokeObjectURL(localUrlRef.current);
        localUrlRef.current = null;
      }
      throw err;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const reset = useCallback(() => {
    if (localUrlRef.current) {
      URL.revokeObjectURL(localUrlRef.current);
      localUrlRef.current = null;
    }
    setUploadedFile(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      if (localUrlRef.current) {
        URL.revokeObjectURL(localUrlRef.current);
      }
    };
  }, []);

  return { uploadFile, uploadedFile, isUploading, error, reset };
}

export default usePhotoUpload;
