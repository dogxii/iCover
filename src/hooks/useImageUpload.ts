import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageFile } from "../types";

type ImageId = ImageFile["id"];

interface UseImageUploadReturn {
  images: Partial<Record<ImageId, ImageFile>>;
  isDragging: Partial<Record<ImageId, boolean>>;
  setImage: (id: ImageId, file: File) => Promise<void>;
  removeImage: (id: ImageId) => void;
  /** Returns props to spread on <input type="file" /> — does NOT include ref */
  getInputProps: (id: ImageId) => Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref">;
  /** Returns a ref callback to attach to <input type="file" /> */
  getInputRef: (id: ImageId) => React.RefCallback<HTMLInputElement>;
  getDragProps: (id: ImageId) => {
    onDragEnter: React.DragEventHandler;
    onDragOver: React.DragEventHandler;
    onDragLeave: React.DragEventHandler;
    onDrop: React.DragEventHandler;
  };
  openFilePicker: (id: ImageId) => void;
}

function readImageDimensions(
  url: string
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function useImageUpload(): UseImageUploadReturn {
  const [images, setImages] = useState<Partial<Record<ImageId, ImageFile>>>({});
  const [isDragging, setIsDragging] = useState<
    Partial<Record<ImageId, boolean>>
  >({});

  // Keep refs to hidden <input type="file"> elements
  const inputRefs = useRef<Partial<Record<ImageId, HTMLInputElement | null>>>({});

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      for (const img of Object.values(images)) {
        if (img?.url) URL.revokeObjectURL(img.url);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setImage = useCallback(async (id: ImageId, file: File) => {
    if (!isImageFile(file)) return;

    // Revoke previous object URL to avoid memory leaks
    setImages((prev) => {
      if (prev[id]?.url) {
        URL.revokeObjectURL(prev[id]!.url);
      }
      return prev;
    });

    const url = URL.createObjectURL(file);

    try {
      const { width, height } = await readImageDimensions(url);
      setImages((prev) => ({
        ...prev,
        [id]: { id, file, url, width, height },
      }));
    } catch {
      URL.revokeObjectURL(url);
    }
  }, []);

  const removeImage = useCallback((id: ImageId) => {
    setImages((prev) => {
      if (prev[id]?.url) {
        URL.revokeObjectURL(prev[id]!.url);
      }
      const next = { ...prev };
      delete next[id];
      return next;
    });
    // Reset the file input so the same file can be re-selected
    const input = inputRefs.current[id];
    if (input) input.value = "";
  }, []);

  const getInputRef = useCallback(
    (id: ImageId): React.RefCallback<HTMLInputElement> =>
      (el: HTMLInputElement | null) => {
        inputRefs.current[id] = el;
      },
    []
  );

  const getInputProps = useCallback(
    (id: ImageId): Omit<React.InputHTMLAttributes<HTMLInputElement>, "ref"> => ({
      type: "file",
      accept: "image/*",
      style: { display: "none" },
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) setImage(id, file);
      },
    }),
    [setImage]
  );

  const getDragProps = useCallback(
    (id: ImageId) => {
      let dragCounter = 0;

      return {
        onDragEnter: (e: React.DragEvent) => {
          e.preventDefault();
          dragCounter++;
          setIsDragging((prev) => ({ ...prev, [id]: true }));
        },
        onDragOver: (e: React.DragEvent) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        },
        onDragLeave: (e: React.DragEvent) => {
          e.preventDefault();
          dragCounter--;
          if (dragCounter <= 0) {
            dragCounter = 0;
            setIsDragging((prev) => ({ ...prev, [id]: false }));
          }
        },
        onDrop: (e: React.DragEvent) => {
          e.preventDefault();
          dragCounter = 0;
          setIsDragging((prev) => ({ ...prev, [id]: false }));

          const file = e.dataTransfer.files[0];
          if (file) setImage(id, file);
        },
      };
    },
    [setImage]
  );

  const openFilePicker = useCallback((id: ImageId) => {
    inputRefs.current[id]?.click();
  }, []);

  return {
    images,
    isDragging,
    setImage,
    removeImage,
    getInputProps,
    getInputRef,
    getDragProps,
    openFilePicker,
  };
}
