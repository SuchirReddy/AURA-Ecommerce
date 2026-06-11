export const openCloudinaryWidget = (options, callback) => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    console.error("Cloudinary credentials are not configured in .env file");
    alert("Cloudinary is not properly configured. Please check your .env file.");
    return;
  }

  const defaultOptions = {
    cloudName: cloudName,
    uploadPreset: uploadPreset,
    sources: ['local', 'url', 'camera', 'unsplash'],
    multiple: false,
    maxFiles: 1,
    clientAllowedFormats: ['image'],
    maxImageFileSize: 5000000, // 5MB limit
    theme: 'minimal'
  };

  const widgetOptions = { ...defaultOptions, ...options };

  const widget = window.cloudinary.createUploadWidget(
    widgetOptions,
    (error, result) => {
      if (!error && result && result.event === "success") {
        console.log("Cloudinary Upload Success:", result.info);
        callback(null, result.info);
      } else if (error) {
        console.error("Cloudinary Upload Error:", error);
        callback(error, null);
      }
    }
  );

  widget.open();
};
