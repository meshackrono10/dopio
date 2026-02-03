"use client";

import React, { FC, useState } from "react";
import { usePropertyForm } from "@/contexts/PropertyFormContext";
import axios from "axios";
import { toast } from "react-toastify";

// Create a dedicated instance for uploads to avoid content-type issues
const uploadApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 60000, // Longer timeout for uploads
});

// Add auth token to upload requests
uploadApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('house_haunters_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface PageAddListing7Props { }

interface UploadProgress {
  fileName: string;
  status: 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
  url?: string;
}

const PageAddListing7: FC<PageAddListing7Props> = () => {
  const { formData, updateFormData } = usePropertyForm();
  const [photoUploads, setPhotoUploads] = useState<UploadProgress[]>([]);
  const [videoUploads, setVideoUploads] = useState<UploadProgress[]>([]);

  const uploadSingleImage = async (file: File, index: number) => {
    const uploadId = `photo-${Date.now()}-${index}`;

    setPhotoUploads(prev => [...prev, {
      fileName: file.name,
      status: 'uploading',
      progress: 0
    }]);

    const formDataUpload = new FormData();
    formDataUpload.append('images', file);

    try {
      const response = await uploadApi.post('/upload/multiple', formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setPhotoUploads(prev => prev.map((upload, i) =>
            i === prev.length - 1 ? { ...upload, progress } : upload
          ));
        }
      });

      // Extract the URL for this specific upload (response.data is an array)
      const url = response.data[0]?.url;

      setPhotoUploads(prev => prev.map((upload, i) =>
        i === prev.length - 1 ? { ...upload, status: 'success', url, progress: 100 } : upload
      ));

      // Return the URL so caller can collect all URLs
      return url;
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      setPhotoUploads(prev => prev.map((upload, i) =>
        i === prev.length - 1
          ? { ...upload, status: 'error', error: error.response?.data?.message || 'Upload failed' }
          : upload
      ));
      return null;
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Collect all uploaded URLs
    const uploadedUrls: (string | null)[] = [];

    // Upload files one by one
    for (let i = 0; i < files.length; i++) {
      const url = await uploadSingleImage(files[i], i);
      uploadedUrls.push(url);
    }

    // Filter out nulls and update formData with all new photos at once
    const validUrls = uploadedUrls.filter((url): url is string => url !== null);
    if (validUrls.length > 0) {
      updateFormData('photos', [...formData.photos, ...validUrls]);
    }

    // Reset input
    e.target.value = '';
  };

  const uploadSingleVideo = async (file: File, index: number) => {
    setVideoUploads(prev => [...prev, {
      fileName: file.name,
      status: 'uploading',
      progress: 0
    }]);

    const formDataUpload = new FormData();
    formDataUpload.append('video', file);

    try {
      // Let the browser set the Content-Type with boundary automatically
      const response = await uploadApi.post('/upload/video', formDataUpload, {
        onUploadProgress: (progressEvent) => {
          const progress = progressEvent.total
            ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
            : 0;
          setVideoUploads(prev => prev.map((upload, i) =>
            i === prev.length - 1 ? { ...upload, progress } : upload
          ));
        }
      });

      const url = response.data.url;

      setVideoUploads(prev => prev.map((upload, i) =>
        i === prev.length - 1 ? { ...upload, status: 'success', url, progress: 100 } : upload
      ));

      updateFormData('videos', [...formData.videos, url]);
    } catch (error: any) {
      console.error('Error uploading video:', error);
      setVideoUploads(prev => prev.map((upload, i) =>
        i === prev.length - 1
          ? { ...upload, status: 'error', error: error.response?.data?.message || 'Upload failed' }
          : upload
      ));
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Upload videos one by one
    for (let i = 0; i < files.length; i++) {
      await uploadSingleVideo(files[i], i);
    }

    // Reset input
    e.target.value = '';
  };

  const retryUpload = async (upload: UploadProgress, type: 'photo' | 'video') => {
    // Remove failed upload from list
    if (type === 'photo') {
      setPhotoUploads(prev => prev.filter(u => u !== upload));
    } else {
      setVideoUploads(prev => prev.filter(u => u !== upload));
    }

    toast.error("Please re-select the file to retry upload.");
  };

  const removePhoto = (index: number) => {
    const newPhotos = formData.photos.filter((_, i) => i !== index);
    updateFormData('photos', newPhotos);
  };

  const removeVideo = (index: number) => {
    const newVideos = formData.videos.filter((_, i) => i !== index);
    updateFormData('videos', newVideos);
  };

  const clearFailedUploads = (type: 'photo' | 'video') => {
    if (type === 'photo') {
      setPhotoUploads(prev => prev.filter(u => u.status !== 'error'));
    } else {
      setVideoUploads(prev => prev.filter(u => u.status !== 'error'));
    }
  };

  return (
    <>
      <div>
        <h2 className="text-2xl font-semibold">Property Photos & Videos</h2>
        <span className="block mt-2 text-neutral-500 dark:text-neutral-400">
          Upload high-quality photos and videos of your property. Minimum 4 photos and 1 video required.
        </span>
      </div>

      <div className="w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* FORM */}
      <div className="space-y-8">
        {/* PHOTOS SECTION */}
        <div>
          <span className="text-lg font-semibold">Property Photos (Minimum 4)</span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-4">
            Include: Living room, bedrooms, kitchen, bathrooms, and building exterior
          </p>

          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 dark:border-neutral-6000 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg
                className="mx-auto h-12 w-12 text-neutral-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
              <div className="flex text-sm text-neutral-6000 dark:text-neutral-300">
                <label
                  htmlFor="photo-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary-6000 hover:text-primary-500"
                >
                  <span>Upload photos</span>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={handlePhotoUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-neutral-500">PNG, JPG up to 10MB each</p>
            </div>
          </div>

          {/* Upload Progress */}
          {photoUploads.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Upload Progress</h4>
                <button
                  onClick={() => clearFailedUploads('photo')}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear Failed
                </button>
              </div>
              {photoUploads.map((upload, idx) => (
                <div key={idx} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm truncate flex-1">{upload.fileName}</span>
                    {upload.status === 'uploading' && (
                      <span className="text-xs text-primary-600">{upload.progress}%</span>
                    )}
                    {upload.status === 'success' && (
                      <i className="las la-check-circle text-green-600 text-xl"></i>
                    )}
                    {upload.status === 'error' && (
                      <button
                        onClick={() => retryUpload(upload, 'photo')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                  {upload.status === 'uploading' && (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Photo Previews */}
          {formData.photos.length > 0 && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.photos.map((photo: string, index: number) => (
                <div key={index} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <i className="las la-times text-lg"></i>
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary-600 text-white text-xs px-2 py-1 rounded">
                      Cover Photo
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* VIDEO SECTION */}
        <div>
          <span className="text-lg font-semibold">Property Video (Minimum 1)</span>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 mb-4">
            Upload a walkthrough video (30 seconds to 2 minutes). Properties with videos get 3x more inquiries!
          </p>

          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-primary-300 dark:border-primary-600 border-dashed rounded-md bg-primary-50 dark:bg-primary-900/10">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="flex text-sm text-neutral-6000 dark:text-neutral-300">
                <label
                  htmlFor="video-upload"
                  className="relative cursor-pointer rounded-md font-medium text-primary-6000 hover:text-primary-500"
                >
                  <span>Upload video</span>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    multiple
                    className="sr-only"
                    onChange={handleVideoUpload}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-neutral-500">MP4, MOV up to 100MB</p>
            </div>
          </div>

          {/* Video Upload Progress */}
          {videoUploads.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Upload Progress</h4>
                <button
                  onClick={() => clearFailedUploads('video')}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Clear Failed
                </button>
              </div>
              {videoUploads.map((upload, idx) => (
                <div key={idx} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm truncate flex-1">{upload.fileName}</span>
                    {upload.status === 'uploading' && (
                      <span className="text-xs text-primary-600">{upload.progress}%</span>
                    )}
                    {upload.status === 'success' && (
                      <i className="las la-check-circle text-green-600 text-xl"></i>
                    )}
                    {upload.status === 'error' && (
                      <button
                        onClick={() => retryUpload(upload, 'video')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </div>
                  {upload.status === 'uploading' && (
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${upload.progress}%` }}
                      ></div>
                    </div>
                  )}
                  {upload.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{upload.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Video Previews */}
          {formData.videos.length > 0 && (
            <div className="mt-6 space-y-4">
              {formData.videos.map((video: string, index: number) => (
                <div key={index} className="relative">
                  <video src={video} controls className="w-full max-h-96 rounded-lg" />
                  <button
                    type="button"
                    onClick={() => removeVideo(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full px-3 py-1 text-sm"
                  >
                    <i className="las la-times"></i> Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <h3 className="font-semibold mb-2">Upload Summary</h3>
          <div className="flex items-center justify-between text-sm">
            <span>Photos:</span>
            <span className={formData.photos.length >= 4 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {formData.photos.length} / 4 minimum
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span>Videos:</span>
            <span className={formData.videos.length >= 1 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
              {formData.videos.length} / 1 minimum
            </span>
          </div>

          {(formData.photos.length < 4 || formData.videos.length < 1) && (
            <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ You need {4 - formData.photos.length > 0 ? `${4 - formData.photos.length} more photo(s)` : ''}
                {formData.photos.length < 4 && formData.videos.length < 1 ? ' and ' : ''}
                {1 - formData.videos.length > 0 ? `${1 - formData.videos.length} more video` : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PageAddListing7;
