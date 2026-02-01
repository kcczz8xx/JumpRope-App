"use client";
import React, { useRef, useState } from "react";

interface FileUploadAreaProps {
  file: File | null;
  existingDocumentUrl?: string;
  acceptedFileTypes: string;
  maxFileSizeMB: number;
  onFileSelect: (file: File | null) => void;
  error?: string;
  onError: (error: string) => void;
}

const UploadIcon = () => (
  <svg
    className="w-8 h-8 text-gray-400"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

const FileIcon = () => (
  <svg
    className="w-5 h-5 text-brand-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
);

const RemoveIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];

export default function FileUploadArea({
  file,
  existingDocumentUrl,
  acceptedFileTypes,
  maxFileSizeMB,
  onFileSelect,
  error,
  onError,
}: FileUploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (selectedFile: File): boolean => {
    onError("");

    if (!ALLOWED_MIME_TYPES.includes(selectedFile.type)) {
      onError("只接受 PDF、JPG 或 PNG 格式的文件");
      return false;
    }

    const maxSize = maxFileSizeMB * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      onError(`文件大小不能超過 ${maxFileSizeMB}MB`);
      return false;
    }

    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && validateFile(droppedFile)) {
      onFileSelect(droppedFile);
    }
  };

  const handleRemoveFile = () => {
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10"
            : error
            ? "border-error-300 dark:border-error-500/50"
            : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFileTypes}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        {file ? (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <FileIcon />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[300px]">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
              className="p-1.5 text-gray-400 hover:text-error-500 transition"
            >
              <RemoveIcon />
            </button>
          </div>
        ) : existingDocumentUrl ? (
          <div className="flex items-center justify-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileIcon />
            <div className="text-left">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                已有文件
              </p>
              <p className="text-xs text-gray-500">拖放或點擊以更換文件</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <UploadIcon />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              拖放文件至此處，或{" "}
              <span className="text-brand-500 font-medium">點擊選擇文件</span>
            </p>
            <p className="text-xs text-gray-400">
              支援 PDF、JPG、PNG，最大 {maxFileSizeMB}MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-1.5 text-xs text-error-500">{error}</p>}
    </div>
  );
}
